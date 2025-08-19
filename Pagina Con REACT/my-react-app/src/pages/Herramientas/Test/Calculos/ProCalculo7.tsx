import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaRedo, FaClock, FaUser, FaSchool, FaBirthdayCake, FaVenusMars, FaPlay, FaFlagCheckered } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './ProCalculo.module.css';
import confetti from 'canvas-confetti';
import RompeCabezasHuevos from '../../Minijuego/RompeCabezasHuevos';
import SnakeGame from '../../Minijuego/SnakeGame';
import jsPDF from 'jspdf';

// Lista de instituciones educativas predefinidas
const institucionesEducativas = [
  "Escuela Sagrado Corazón de Jesús",
  "Colegio Sagrado Corazón de Jesús",
  "Colegio Hermano Miguel La Salle",
  "Unidad Educativa Fiscomisional Hermano Miguel La Salle",
  "Unidad Educativa Fiscomisional María Auxiliadora",
  "Escuela de Educación Básica Mundo Feliz",
  "Escuela San Antonio de Padua",
  "Escuela de Educación Básica Cristo Rey",
  "Unidad Educativa Cristo Rey",
  "Escuela de Educación Básica Americano",
  "Unidad Educativa Americano",
  "Escuela Gotitas de Miel",
  "Escuela Pequeños Emprendedores",
  "Escuela Shiny Kids",
  "Unidad Educativa Consejo Provincial del Carchi",
  "Unidad de Educación Especializada del Carchi",
  "Unidad Educativa Alejandro R. Mera",
  "Unidad Educativa Isaac Acosta Calderón",
  "Unidad Educativa Vicente Fierro",
  "Unidad Educativa Fiscomisional Monseñor Leonidas Proaño PCEI",
  "Unidad Educativa William Shakespeare",
  "Otra institución"
];

// Interfaces
interface QuestionItem {
  question: string;
  answer: string | number;
  points: number;
  type: 'escrito';
  image?: string;
  providedAnswer?: string | number;
}

interface Subtest {
  name: string;
  maxScore: number;
  items: QuestionItem[];
}

interface StudentData {
  nombres: string;
  apellidos: string;
  edad: string;
  genero: string;
  curso: string;
  institucion: string;
}

const ProCalculo7: React.FC = () => {
  const navigate = useNavigate();
  const [currentSubtest, setCurrentSubtest] = useState(0);
  const [currentItem, setCurrentItem] = useState(0);
  const [score, setScore] = useState<number[]>(Array(12).fill(0));
  const [showResult, setShowResult] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<boolean | null>(null);
  const [animation, setAnimation] = useState('');
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [writtenAnswerConfirmed, setWrittenAnswerConfirmed] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [miniGameType, setMiniGameType] = useState<'egg' | 'snake'>('egg');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [studentData, setStudentData] = useState<StudentData>({
    nombres: '',
    apellidos: '',
    edad: '',
    genero: '',
    curso: '',
    institucion: '',
  });
  const [showStudentForm, setShowStudentForm] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStartTime, setTestStartTime] = useState<string>('');
  const [testStarted, setTestStarted] = useState(false);
  const [showFinishScreen, setShowFinishScreen] = useState(false);

  const minigameSubtests = [3, 6, 9];

  const [subtests, setSubtests] = useState<Subtest[]>([
    {
      name: "Enumeración",
      maxScore: 12,
      items: [
        { question: "¿Cuántos globos hay en la imagen?", answer: "13", points: 4, type: "escrito", image: '/img/Test_7 Enumeración_13.png' },
        { question: "¿Cuántos paletas hay en la imagen?", answer: "8", points: 4, type: "escrito", image: '/img/Test_7 Enumeración_8.png' },
        { question: "¿Cuántos autos hay en la imagen?", answer: "10", points: 4, type: "escrito", image: '/img/Test_7 Enumeración_10.png' }
      ]
    },
    {
      name: "Contar para atrás",
      maxScore: 2,
      items: [
        { question: "Escribe los números contando hacia atrás desde 15 hasta 0 (separados por comas)", answer: "15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0", points: 2, type: "escrito", image: '/img/Test_7 Contar para atrás_15.png' }
      ]
    },
    {
      name: "Escritura de números",
      maxScore: 8,
      items: [
        { question: "Escribe el número 'treinta y ocho'", answer: "38", points: 2, type: "escrito", image: '/img/Test_7 Escritura_38.png' },
        { question: "Escribe el número 'ciento sesenta y nueve'", answer: "169", points: 2, type: "escrito", image: '/img/Test_7 Escritura_169.png' },
        { question: "Escribe el número 'noventa y siete'", answer: "97", points: 2, type: "escrito", image: '/img/Test_7 Escritura_97.png' },
        { question: "Escribe el número 'mil doscientos'", answer: "1200", points: 2, type: "escrito", image: '/img/Test_7 Escritura_1200.png' }
      ]
    },
    {
      name: "Cálculo mental oral",
      maxScore: 12,
      items: [
        { question: "10 + 10", answer: "20", points: 2, type: "escrito", image: '/img/Test_7 Cálculo_20.png' },
        { question: "1 + 15", answer: "16", points: 2, type: "escrito", image: '/img/Test_7 Cálculo_16.png' },
        { question: "12 + 7", answer: "19", points: 2, type: "escrito", image: '/img/Test_7 Cálculo_19.png' },
        { question: "10 - 3", answer: "7", points: 2, type: "escrito", image: '/img/Test_7 Cálculo_7.png' },
        { question: "18 - 6", answer: "12", points: 2, type: "escrito", image: '/img/Test_7 Cálculo_12.png' },
        { question: "25 - 12", answer: "13", points: 2, type: "escrito", image: '/img/Test_7 Cálculo_13.png' }
      ]
    },
    {
      name: "Lectura de números",
      maxScore: 8,
      items: [
        { question: "Lee y escribe con palabras minúsculas el número: 57", answer: "cincuenta y siete", points: 2, type: "escrito", image: '/img/Test_7 Lectura_57.png' },
        { question: "Lee y escribe con palabras minúsculas el número: 15", answer: "quince", points: 2, type: "escrito", image: '/img/Test_7 Lectura_15.png' },
        { question: "Lee y escribe con palabras minúsculas el número: 138", answer: "ciento treinta y ocho", points: 2, type: "escrito", image: '/img/Test_7 Lectura_138.png' },
        { question: "Lee y escribe con palabras minúsculas el número: 9", answer: "nueve", points: 2, type: "escrito", image: '/img/Test_7 Lectura_9.png' }
      ]
    },
    {
      name: "Posicionar en escala",
      maxScore: 6,
      items: [
        { question: "¿Dónde colocarías el número 56 en una escala del 0 al 100? (elige 1, 2 o 3)", answer: "2", points: 2, type: "escrito", image: '/img/Test_7 Escala_56.png' },
        { question: "¿Dónde colocarías el número 80 en una escala del 0 al 100? (elige 1, 2 o 3)", answer: "3", points: 2, type: "escrito", image: '/img/Test_7 Escala_80.png' },
        { question: "¿Dónde colocarías el número 62 en una escala del 0 al 100? (elige 1, 2 o 3)", answer: "2", points: 2, type: "escrito", image: '/img/Test_7 Escala_62.png' },
        { question: "¿Dónde colocarías el número 10 en una escala del 0 al 100? (elige 1, 2 o 3)", answer: "1", points: 2, type: "escrito", image: '/img/Test_7 Escala_10.png' }
      ]
    },
    {
      name: "Estimación perceptiva",
      maxScore: 4,
      items: [
        { question: "¿Cuántas pelotas y vasos hay en total? Escribe: número de pelotas y número de vasos totales", answer: "16", points: 4, type: "escrito", image: '/img/Test_7 Estimación_16.png' }
      ]
    },
    {
      name: "Estimación en contexto",
      maxScore: 6,
      items: [
        { question: "¿12 nubes en el cielo es poco o mucho? (Escribe 'poco' o 'mucho')", answer: "mucho", points: 2, type: "escrito", image: '/img/Test_7 Estimación_12.png' },
        { question: "¿2 niños jugando en el recreo es poco o mucho? (Escribe 'poco' o 'mucho')", answer: "poco", points: 2, type: "escrito", image: '/img/Test_7 Estimación_2.png' },
        { question: "¿60 niños en un cumpleaños es poco o mucho? (Escribe 'poco' o 'mucho')", answer: "mucho", points: 2, type: "escrito", image: '/img/Test_7 Estimación_60.png' }
      ]
    },
    {
      name: "Resolución de problemas",
      maxScore: 8,
      items: [
        { question: "12 - 5", answer: "7", points: 2, type: "escrito", image: '/img/Test_7 Resolución_7.png' },
        { question: "16 - 4", answer: "12", points: 2, type: "escrito", image: '/img/Test_7 Resolución_12.png' },
        { question: "6 + 7", answer: "13", points: 2, type: "escrito", image: '/img/Test_7 Resolución_13.png' },
        { question: "4 + (4+3) + (7-2)", answer: "16", points: 2, type: "escrito", image: '/img/Test_7 Resolución_16.png' }
      ]
    },
    {
      name: "Comparación de números",
      maxScore: 6,
      items: [
        { question: "¿Cuál es mayor: 654 o 546? (Escribe el número mayor)", answer: "654", points: 2, type: "escrito", image: '/img/Test_7 Comparación_654.png' },
        { question: "¿Cuál es mayor: 97 o 352? (Escribe el número mayor)", answer: "352", points: 2, type: "escrito", image: '/img/Test_7 Comparación_352.png' },
        { question: "¿Cuál es mayor: 96 o 69? (Escribe el número mayor)", answer: "96", points: 2, type: "escrito", image: '/img/Test_7 Comparación_96.png' }
      ]
    },
    {
      name: "Determinación de cantidad",
      maxScore: 12,
      items: [
        { question: "Escribe el número menor en: 5, 8520, 000, 12, 49, 50, 97", answer: "0", points: 6, type: "escrito", image: '/img/Test_7 Determinación_0.png' },
        { question: "Escribe el número mayor en: 1234, 1993, 3000, 8520", answer: "8520", points: 6, type: "escrito", image: '/img/Test_7 Determinación_8520.png' }
      ]
    },
    {
      name: "Escribir en cifra",
      maxScore: 3,
      items: [
        { question: "Escribe los 5 números que siguen después de 137 (separados por comas)", answer: "138,139,140,141,142", points: 1, type: "escrito", image: '/img/Test_7 Escribir_137D.png' },
        { question: "Escribe los 5 números antes de 362 (separados por comas)", answer: "361,360,359,358,357", points: 1, type: "escrito", image: '/img/Test_7 Escribir_362A.png' },
        { question: "Escribe los 5 números después de 362 (separados por comas)", answer: "363,364,365,366,367", points: 1, type: "escrito", image: '/img/Test_7 Escribir_362D.png' }
      ]
    }
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testStarted && timerActive && timeLeft > 0 && !showMiniGame && !showFinishScreen) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showResult && !timeUp) {
      setTimerActive(false);
      setTimeUp(true);
      setShowFinishScreen(true);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, timerActive, showResult, timeUp, showMiniGame, showFinishScreen, testStarted]);

  useEffect(() => {
    if (testStarted && timerActive) {
      const now = new Date();
      setTestStartTime(now.toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Guayaquil' }));
    }
  }, [testStarted, timerActive]);

  const normalizeText = (text: string): string => {
    return text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const edadNum = parseInt(studentData.edad);
    if (!studentData.nombres.trim()) errors.nombres = 'Por favor ingresa los nombres';
    if (!studentData.apellidos.trim()) errors.apellidos = 'Por favor ingresa los apellidos';
    if (!studentData.edad || isNaN(edadNum)) errors.edad = 'Edad inválida';
    if (edadNum < 6 || edadNum > 8) errors.edad = 'La edad debe estar entre 6 y 8 años';
    if (!studentData.genero) errors.genero = 'Selecciona un género';
    if (!studentData.curso.trim()) errors.curso = 'Ingresa el curso/grado';
    if (!studentData.institucion.trim()) errors.institucion = 'Selecciona la institución educativa';
    setFormErrors(errors);
    if (!errors.edad) {
      setStudentData(prev => ({
        ...prev,
        edad: edadNum.toString(),
      }));
    }
    return Object.keys(errors).length === 0;
  };

  const saveStudentData = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowStudentForm(false);
    } catch (error) {
      console.error('Error al guardar datos:', error);
      alert('Ocurrió un error al guardar los datos. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startTest = () => {
    setTestStarted(true);
    setTimerActive(true);
    const now = new Date();
    setTestStartTime(now.toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Guayaquil' }));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (selectedAnswer: string | number) => {
    if (showFeedback || timeUp) return;
    const currentQuestion = subtests[currentSubtest].items[currentItem];
    const isCorrect = normalizeText(selectedAnswer.toString()) === normalizeText(currentQuestion.answer.toString());

    setSubtests(prevSubtests => {
      const newSubtests = [...prevSubtests];
      newSubtests[currentSubtest].items[currentItem] = {
        ...newSubtests[currentSubtest].items[currentItem],
        providedAnswer: selectedAnswer,
      };
      return newSubtests;
    });

    setCorrectAnswer(isCorrect);
    setShowFeedback(true);
    if (isCorrect) {
      const newScore = [...score];
      newScore[currentSubtest] += currentQuestion.points;
      setScore(newScore);
      setAnimation('correct');
    } else {
      setAnimation('wrong');
    }
    setTimeout(() => {
      moveToNextItem();
    }, 2000);
  };

  const moveToNextItem = () => {
    setShowFeedback(false);
    setCorrectAnswer(null);
    setAnimation('');
    setWrittenAnswer('');
    setWrittenAnswerConfirmed(false);
    if (currentItem + 1 >= subtests[currentSubtest].items.length) {
      const nextSubtest = currentSubtest + 1;
      if (minigameSubtests.includes(currentSubtest)) {
        setShowMiniGame(true);
        setMiniGameType(currentSubtest === 3 || currentSubtest === 9 ? 'egg' : 'snake');
        return;
      }
      if (nextSubtest < subtests.length) {
        setCurrentSubtest(nextSubtest);
        setCurrentItem(0);
      } else {
        setShowFinishScreen(true);
      }
    } else {
      setCurrentItem(currentItem + 1);
    }
  };

  const finishTest = () => {
    setShowFinishScreen(false);
    setShowResult(true);
    setTimerActive(false);
    const totalScore = score.reduce((a, b) => a + b, 0);
    if (totalScore > 50) {
      launchConfetti();
    }
  };

  const handleMiniGameComplete = (success: boolean) => {
    setShowMiniGame(false);
    setAnimation(success ? 'correct' : 'wrong');
    setTimeout(() => {
      setAnimation('');
      const nextSubtest = currentSubtest + 1;
      if (nextSubtest < subtests.length) {
        setCurrentSubtest(nextSubtest);
        setCurrentItem(0);
      } else {
        setShowFinishScreen(true);
      }
    }, 1000);
  };

  const launchConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const restartTest = () => {
    setCurrentSubtest(0);
    setCurrentItem(0);
    setScore(Array(12).fill(0));
    setShowResult(false);
    setShowFeedback(false);
    setCorrectAnswer(null);
    setAnimation('');
    setWrittenAnswer('');
    setWrittenAnswerConfirmed(false);
    setShowMiniGame(false);
    setMiniGameType('egg');
    setTimeLeft(25 * 60);
    setTimerActive(false);
    setTimeUp(false);
    setShowStudentForm(true);
    setTestStartTime('');
    setTestStarted(false);
    setShowFinishScreen(false);
    setSubtests(prevSubtests =>
      prevSubtests.map(subtest => ({
        ...subtest,
        items: subtest.items.map(item => ({
          ...item,
          providedAnswer: undefined,
        })),
      }))
    );
  };

  const getResultMessage = () => {
    const totalScore = score.reduce((a, b) => a + b, 0);
    const percentage = (totalScore / 87) * 100;
    if (timeUp) return "¡Tiempo terminado! ⏰";
    if (percentage >= 80) return "¡Excelente trabajo! 🎉";
    if (percentage >= 60) return "¡Muy bien hecho! 🌟";
    if (percentage >= 40) return "¡Buen intento! 👍";
    return "¡Sigue practicando! 💪";
  };

  const handleConfirmAnswer = () => {
    if (writtenAnswer.trim()) {
      handleAnswer(writtenAnswer.trim());
      setWrittenAnswerConfirmed(false);
    }
  };

  const handleCancelAnswer = () => {
    setWrittenAnswerConfirmed(false);
  };

  const handleSubmitAnswer = () => {
    if (writtenAnswer.trim() && !showFeedback && !timeUp) {
      setWrittenAnswerConfirmed(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudentData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const calculateTotalScore = (): number => {
    return score.reduce((a, b) => a + b, 0);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    const maxWidth = 190 - (2 * margin);
    let yPos = 20;

    // Page 1: Student Data and Total Score
    doc.setFontSize(30);
    doc.text('RESULTADO DEL TEST - 7', 105, yPos, { align: 'center' });
    yPos += 20;

    doc.setFontSize(14);
    doc.text('Datos del Estudiante', margin, yPos);
    yPos += 10;
    doc.setLineWidth(0.5);
    yPos -= 5;
    doc.line(margin, yPos, 190 - margin, yPos);
    yPos += 10;

    doc.setFontSize(12);
    const studentDataLines = [
      `Nombre: ${studentData.nombres || 'No especificado'}`,
      `Apellido: ${studentData.apellidos || 'No especificado'}`,
      `Edad: ${studentData.edad || 'No especificado'}`,
      `Género: ${studentData.genero === 'M' ? 'Masculino' : studentData.genero === 'F' ? 'Femenino' : 'No especificado'}`,
      `Curso/Grado: ${studentData.curso || 'No especificado'}`,
      `Institución: ${studentData.institucion || 'No especificado'}`,
      `Fecha y hora de inicio: ${testStartTime || 'No especificado'}`,
    ];
    studentDataLines.forEach(line => {
      const textLines = doc.splitTextToSize(line, maxWidth);
      textLines.forEach((textLine: string) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(textLine, margin, yPos);
        yPos += 8;
      });
    });
    yPos += 15;

    doc.setFontSize(14);
    yPos += 10;
    doc.setLineWidth(0.5);
    yPos -= 5;
    doc.line(margin, yPos, 190 - margin, yPos);
    yPos += 10;

    doc.setFontSize(20);
    const totalScoreText = `Puntuación total: ${calculateTotalScore()}/87 Puntos`;
    doc.setFont('helvetica', 'bold');
    const totalScoreLines = doc.splitTextToSize(totalScoreText, maxWidth);
    totalScoreLines.forEach((textLine: string) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(textLine, margin, yPos);
      yPos += 8;
    });
    doc.setFont('helvetica', 'normal');
    yPos += 15;

    subtests.forEach((subtest, idx) => {
      if (subtest.items.length === 0) return;

      doc.addPage();
      yPos = 20;

      doc.setFontSize(14);
      const subtestTitle = `Sección: ${subtest.name}`;
      const subtestTitleLines = doc.splitTextToSize(subtestTitle, maxWidth);
      subtestTitleLines.forEach((textLine: string) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(textLine, margin, yPos);
        yPos += 10;
      });
      yPos += 5;
      doc.setLineWidth(0.5);
      yPos -= 5;
      doc.line(margin, yPos, 190 - margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      const subtestScoreText = `Puntuación: ${score[idx]} / ${subtest.maxScore}`;
      const subtestScoreLines = doc.splitTextToSize(subtestScoreText, maxWidth);
      subtestScoreLines.forEach((textLine: string) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(textLine, margin, yPos);
        yPos += 8;
      });
      yPos += 15;

      subtest.items.forEach((item, itemIdx) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        const questionText = `Pregunta ${itemIdx + 1}: ${item.question}`;
        const questionLines = doc.splitTextToSize(questionText, maxWidth);
        questionLines.forEach((textLine: string) => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(textLine, margin, yPos);
          yPos += 8;
        });

        const correctAnswerText = `Respuesta esperada: ${item.answer}`;
        const correctAnswerLines = doc.splitTextToSize(correctAnswerText, maxWidth);
        correctAnswerLines.forEach((textLine: string) => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(textLine, margin, yPos);
          yPos += 8;
        });

        const providedAnswer = item.providedAnswer !== undefined && item.providedAnswer !== null
          ? item.providedAnswer
          : 'No proporcionada';
        const providedAnswerText = `Respuesta proporcionada: ${providedAnswer}`;
        const providedAnswerLines = doc.splitTextToSize(providedAnswerText, maxWidth);
        providedAnswerLines.forEach((textLine: string) => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(textLine, margin, yPos);
          yPos += 8;
        });

        const pointsObtained = item.providedAnswer !== undefined && item.providedAnswer !== null
          ? (normalizeText(item.providedAnswer.toString()) === normalizeText(item.answer.toString()) ? item.points : 0)
          : 0;
        const pointsText = `Puntos obtenidos: ${pointsObtained} / ${item.points}`;
        const pointsLines = doc.splitTextToSize(pointsText, maxWidth);
        pointsLines.forEach((textLine: string) => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(textLine, margin, yPos);
          yPos += 15;
        });
      });
    });

    doc.save(`Resultado_Test_7_${studentData.nombres || 'Usuario'}_${studentData.apellidos || 'Desconocido'}.pdf`);
  };

  const renderStudentForm = () => (
    <div className={styles.studentFormContainer}>
      <div className={styles.studentFormCard}>
        <h2 className={styles.formTitle}>
          <FaUser /> Datos del Estudiante
        </h2>
        <div className={styles.formGroup}>
          <label htmlFor="nombres">
            <FaUser /> Nombres:
          </label>
          <input
            type="text"
            id="nombres"
            name="nombres"
            value={studentData.nombres}
            onChange={handleInputChange}
            className={formErrors.nombres ? styles.inputError : ''}
            disabled={isSubmitting}
          />
          {formErrors.nombres && <span className={styles.errorMessage}>{formErrors.nombres}</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="apellidos">
            <FaUser /> Apellidos:
          </label>
          <input
            type="text"
            id="apellidos"
            name="apellidos"
            value={studentData.apellidos}
            onChange={handleInputChange}
            className={formErrors.apellidos ? styles.inputError : ''}
            disabled={isSubmitting}
          />
          {formErrors.apellidos && <span className={styles.errorMessage}>{formErrors.apellidos}</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="edad">
            <FaBirthdayCake /> Edad:
          </label>
          <input
            type="number"
            id="edad"
            name="edad"
            value={studentData.edad}
            onChange={handleInputChange}
            min="6"
            max="8"
            className={formErrors.edad ? styles.inputError : ''}
            disabled={isSubmitting}
          />
          {formErrors.edad && <span className={styles.errorMessage}>{formErrors.edad}</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="genero">
            <FaVenusMars /> Género:
          </label>
          <select
            id="genero"
            name="genero"
            value={studentData.genero}
            onChange={handleInputChange}
            className={formErrors.genero ? styles.inputError : ''}
            disabled={isSubmitting}
          >
            <option value="">Selecciona...</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
          {formErrors.genero && <span className={styles.errorMessage}>{formErrors.genero}</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="curso">
            <FaSchool /> Curso/Grado:
          </label>
          <input
            type="text"
            id="curso"
            name="curso"
            value={studentData.curso}
            onChange={handleInputChange}
            className={formErrors.curso ? styles.inputError : ''}
            disabled={isSubmitting}
            placeholder="Ejemplo: 2do de Educación Básica"
          />
          {formErrors.curso && <span className={styles.errorMessage}>{formErrors.curso}</span>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="institucion">
            <FaSchool /> Institución Educativa:
          </label>
          <select
            id="institucion"
            name="institucion"
            value={studentData.institucion}
            onChange={handleInputChange}
            className={formErrors.institucion ? styles.inputError : ''}
            disabled={isSubmitting}
          >
            <option value="">Selecciona tu institución...</option>
            {institucionesEducativas.map((institucion, index) => (
              <option key={index} value={institucion}>
                {institucion}
              </option>
            ))}
          </select>
          {formErrors.institucion && <span className={styles.errorMessage}>{formErrors.institucion}</span>}
        </div>
        <div className={styles.formActions}>
          <button
            className={styles.startTestButton}
            onClick={saveStudentData}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Cargando...' : <><FaPlay /> Comenzar Test</>}
          </button>
        </div>
      </div>
    </div>
  );

  const renderInputField = () => {
    const currentQuestion = subtests[currentSubtest].items[currentItem];
    return (
      <div className={styles.writtenAnswerContainer}>
        {currentQuestion.image && (
          <div className={styles.questionImageContainer}>
            <img 
              src={currentQuestion.image} 
              alt={currentQuestion.question}
              className={styles.questionImage}
            />
          </div>
        )}
        <div className={styles.inputContainer}>
          <input
            type="text"
            className={styles.textInput}
            placeholder="Escribe tu respuesta aquí..."
            value={writtenAnswer}
            onChange={(e) => {
              setWrittenAnswer(e.target.value);
              setWrittenAnswerConfirmed(false);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && writtenAnswer.trim() && !showFeedback) {
                handleSubmitAnswer();
              }
            }}
            disabled={timeUp || showFeedback}
          />
          <button 
            className={styles.submitButton}
            onClick={handleSubmitAnswer}
            disabled={!writtenAnswer.trim() || timeUp || showFeedback}
          >
            Enviar respuesta
          </button>
        </div>
        {writtenAnswerConfirmed && !showFeedback && (
          <div className={styles.confirmationButtons}>
            <p>Tu respuesta: <strong>"{writtenAnswer}"</strong></p>
            <p>¿Estás seguro de tu respuesta?</p>
            <div className={styles.confirmationButtonGroup}>
              <button 
                className={styles.confirmButton}
                onClick={handleConfirmAnswer}
                disabled={timeUp}
              >
                Sí, confirmar
              </button>
              <button 
                className={styles.cancelButton}
                onClick={handleCancelAnswer}
                disabled={timeUp}
              >
                No, corregir
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderQuestion = () => {
    const currentSubtestData = subtests[currentSubtest];
    const currentQuestion = currentSubtestData.items[currentItem];
    return (
      <div className={styles.questionContent}>
        <h3 className={styles.subtestTitle}>{currentSubtestData.name}</h3>
        <p className={styles.questionPrompt}>{currentQuestion.question}</p>
        {renderInputField()}
        {showFeedback && (
          <div className={`${styles.feedback} ${correctAnswer ? styles.correctFeedback : styles.incorrectFeedback}`}>
            <p>
              {correctAnswer 
                ? "¡Correcto! 🎉" 
                : `La respuesta correcta es: ${currentQuestion.answer}`}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderMiniGame = () => (
    <div className={styles.miniGameContainer}>
      {miniGameType === 'egg' ? (
        <RompeCabezasHuevos onComplete={handleMiniGameComplete} />
      ) : (
        <SnakeGame onComplete={handleMiniGameComplete} />
      )}
    </div>
  );

  const renderStartTestScreen = () => (
    <div className={styles.startTestContainer}>
      <div className={styles.startTestCard}>
        <h2>¡Todo listo para comenzar!</h2>
        <p>El test tiene una duración máxima de 25 minutos.</p>
        <p>Por favor, asegúrate de estar en un lugar tranquilo y sin distracciones.</p>
        <button 
          className={styles.startTestButton}
          onClick={startTest}
        >
          <FaPlay /> Iniciar Test
        </button>
      </div>
    </div>
  );

  const renderFinishScreen = () => (
    <div className={styles.finishTestContainer}>
      <div className={styles.finishTestCard}>
        <h2>¡Has completado todas las preguntas!</h2>
        <p>Tiempo restante: {formatTime(timeLeft)}</p>
        <p>¿Deseas finalizar el test ahora y ver tus resultados?</p>
        <button 
          className={styles.finishTestButton}
          onClick={finishTest}
          disabled={isSubmitting}
        >
          <FaFlagCheckered /> {isSubmitting ? 'Finalizando...' : 'Finalizar Test'}
        </button>
      </div>
    </div>
  );

  const renderResults = () => (
    <section className={styles.resultSection}>
      <div className={styles.resultContainer}>
        <h2 className={styles.resultTitle}>
          {getResultMessage()}
        </h2>
        <div className={styles.scoreCard}>
          <div className={styles.scoreVisual}>
            <div className={styles.scoreCircle}>
              <span className={styles.scoreNumber}>{score.reduce((a, b) => a + b, 0)}</span>
              <span className={styles.scoreTotal}>/87</span>
            </div>
            {timeUp && (
              <div className={styles.timeUpWarning}>
                ⏰ El tiempo ha terminado
              </div>
            )}
          </div>
          <p className={styles.scoreText}>
            Puntuación total: <span className={styles.scoreHighlight}>{score.reduce((a, b) => a + b, 0)}</span> de 87 puntos
          </p>
          <div className={styles.subtestScores}>
            <h3>Puntuación por subtest:</h3>
            <ul>
              {subtests.map((subtest, idx) => (
                <li key={idx}>
                  {subtest.name}: {score[idx]} / {subtest.maxScore}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.actionsContainer}>
            <button 
              className={styles.restartButton}
              onClick={restartTest}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : <><FaRedo /> Intentar de nuevo</>}
            </button>
            <button 
              className={styles.homeButton}
              onClick={() => navigate('/herramientas/test')}
            >
              Elegir otra prueba
            </button>
            <button 
              className={styles.restartButton}
              onClick={generatePDF}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Generando...' : <><FaRedo /> Descargar PDF</>}
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderTestInProgress = () => (
    <>
      <section className={styles.testHeader}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.testTitle}>
            <img src="/img/test.png" alt="Logo de Media Lab" className={styles.logoSmall} />
            Pro-Cálculo <span className={styles.ageBadge}>7 años</span>
          </h1>
        </div>
        <div className={styles.controlButtons}>
          <a href="/Herramientas/test" className={styles.backButton}>
            <FaArrowLeft /> Volver
          </a>
        </div>
      </section>
      <section className={`${styles.questionSection} ${animation ? styles[animation] : ''}`}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ 
              width: `${((currentSubtest + currentItem / subtests[currentSubtest].items.length) / subtests.length) * 100}%` 
            }}
          ></div>
        </div>
        <div className={styles.questionInfo}>
          <div className={styles.questionCounter}>
            Subtest {currentSubtest + 1} de {subtests.length} - Ítem {currentItem + 1} de {subtests[currentSubtest].items.length}
          </div>
          <div className={styles.timer}>
            <FaClock /> Tiempo restante: {formatTime(timeLeft)}
          </div>
        </div>
        <div className={styles.questionCard}>
          {renderQuestion()}
        </div>
      </section>
    </>
  );

  return (
    <div className={styles.pageContainer}>
      <main className={styles.testContainer}>
        <div className={styles.cloudBackground}></div>
        {showStudentForm ? (
          renderStudentForm()
        ) : showMiniGame ? (
          renderMiniGame()
        ) : showResult ? (
          renderResults()
        ) : showFinishScreen ? (
          renderFinishScreen()
        ) : !testStarted ? (
          renderStartTestScreen()
        ) : (
          renderTestInProgress()
        )}
      </main>
    </div>
  );
};

export default ProCalculo7;