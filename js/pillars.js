/** Datos estáticos de los pilares. Los identificadores se mantienen estables. */
export const PILLARS = [
  {
    id: 'finances',
    name: 'Finanzas y economía',
    icon: '$',
    color: '#2563eb',
    softColor: '#dbeafe',
    question: '¿Tengo tranquilidad financiera y estoy construyendo mi futuro económico?',
    description: 'Tu relación con el dinero: ingresos, gastos, ahorro, deudas y planificación.',
    focus: 'Busca claridad antes que perfección. Conocer tu situación actual es un primer paso útil.',
    tips: [
      'Registra tus gastos para comprender a dónde va tu dinero.',
      'Define una meta de ahorro realista, aunque empieces con una cantidad pequeña.',
      'Reserva un momento semanal para revisar pagos y compromisos próximos.'
    ],
    examples: ['Registrar los gastos de la semana', 'Revisar el presupuesto durante 15 minutos', 'Separar una cantidad para el ahorro']
  },
  {
    id: 'health',
    name: 'Salud y bienestar físico',
    icon: '♡',
    color: '#c2410c',
    softColor: '#ffedd5',
    question: '¿Estoy cuidando mi cuerpo y tengo energía para mi día a día?',
    description: 'Alimentación, actividad física, descanso, energía y cuidado del cuerpo.',
    focus: 'Prioriza hábitos sostenibles y adecuados para ti; no necesitas cambiar todo al mismo tiempo.',
    tips: [
      'Planifica momentos realistas para moverte y descansar.',
      'Observa qué hábitos te ayudan a sentirte con más energía.',
      'Elige una acción pequeña y segura que puedas repetir esta semana.'
    ],
    examples: ['Caminar 20 minutos tres días', 'Preparar opciones de comida para la semana', 'Establecer una hora para desconectar antes de dormir']
  },
  {
    id: 'personal-growth',
    name: 'Desarrollo personal',
    icon: '✦',
    color: '#7c3aed',
    softColor: '#ede9fe',
    question: '¿Estoy creciendo como persona y desarrollando las habilidades que quiero para mi futuro?',
    description: 'Autoconocimiento, hábitos, autodisciplina, aprendizaje, idiomas y nuevas habilidades.',
    focus: 'El crecimiento se construye con acciones pequeñas, reflexión y constancia, no con exigencia perfecta.',
    tips: [
      'Convierte una intención general en una actividad concreta y medible.',
      'Divide un objetivo difícil en sesiones cortas de práctica.',
      'Al final de la semana, anota qué aprendiste y qué ajustarás.'
    ],
    examples: ['Practicar inglés durante 20 minutos', 'Leer 10 páginas de un libro', 'Escribir una reflexión personal']
  },
  {
    id: 'relationships',
    name: 'Familia y relaciones',
    icon: '◎',
    color: '#be185d',
    softColor: '#fce7f3',
    question: '¿Me siento conectado con las personas que son importantes para mí?',
    description: 'La calidad de las relaciones con familiares, amistades, pareja y otras personas importantes.',
    focus: 'La conexión tiene muchas formas. Considera tus necesidades, tus límites y los de las demás personas.',
    tips: [
      'Reserva un momento para escuchar a alguien importante para ti.',
      'Expresa agradecimiento o reconocimiento de manera sincera.',
      'Respeta tus propios límites y los de las demás personas.'
    ],
    examples: ['Llamar a un familiar o amigo', 'Compartir una comida sin pantallas', 'Conversar con alguien importante durante 15 minutos']
  },
  {
    id: 'career',
    name: 'Trabajo y carrera profesional',
    icon: '▣',
    color: '#047857',
    softColor: '#d1fae5',
    question: '¿Estoy satisfecho con mi situación laboral y avanzo hacia donde quiero llegar?',
    description: 'Empleo, profesión, habilidades laborales, satisfacción y oportunidades de crecimiento.',
    focus: 'Tu situación puede depender de factores externos. Evalúa lo que puedes influir sin culparte por lo que no controlas.',
    tips: [
      'Identifica una habilidad profesional que quieras fortalecer.',
      'Divide un proyecto importante en el siguiente paso concreto.',
      'Reserva tiempo para revisar tus prioridades y tu bienestar laboral.'
    ],
    examples: ['Completar una lección de una habilidad laboral', 'Actualizar una sección del currículum', 'Planificar las tres prioridades de trabajo']
  },
  {
    id: 'leisure',
    name: 'Diversión y ocio',
    icon: '☼',
    color: '#a16207',
    softColor: '#fef3c7',
    question: '¿Tengo tiempo para disfrutar y hacer cosas que me gustan?',
    description: 'Pasatiempos, entretenimiento, experiencias, viajes y descanso recreativo.',
    focus: 'Descansar y disfrutar también forman parte de una vida equilibrada; no todo tiene que ser productivo.',
    tips: [
      'Agenda una actividad que disfrutes sin convertirla en una obligación.',
      'Prueba una actividad sencilla que te despierte curiosidad.',
      'Observa si tienes espacio real para descansar durante la semana.'
    ],
    examples: ['Dedicar 30 minutos a un pasatiempo', 'Ver una película o escuchar música', 'Salir a un lugar agradable']
  },
  {
    id: 'spirituality',
    name: 'Práctica espiritual',
    icon: '✧',
    color: '#0369a1',
    softColor: '#e0f2fe',
    question: '¿Dedico tiempo a la reflexión, la oración o las prácticas espirituales que son importantes para mí?',
    description: 'Oración, meditación, reflexión o participación religiosa, según las creencias personales.',
    focus: 'Esta área es personal. Puedes definirla desde tus creencias, valores o prácticas de reflexión, sin una única forma correcta.',
    tips: [
      'Reserva un momento tranquilo para la práctica que elijas.',
      'Reflexiona sobre los valores que quieres llevar a tus decisiones.',
      'Elige una práctica que tenga sentido para ti, sin compararte con otras personas.'
    ],
    examples: ['Dedicar 10 minutos a orar o meditar', 'Leer un texto espiritual o reflexivo', 'Asistir a una actividad de tu comunidad si lo deseas']
  }
];

export const PILLAR_BY_ID = Object.fromEntries(PILLARS.map((pillar) => [pillar.id, pillar]));
