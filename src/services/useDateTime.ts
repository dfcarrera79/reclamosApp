export const meses = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const monthOptions = [
  { nombre: 'Enero', codigo: 1 },
  { nombre: 'Febrero', codigo: 2 },
  { nombre: 'Marzo', codigo: 3 },
  { nombre: 'Abril', codigo: 4 },
  { nombre: 'Mayo', codigo: 5 },
  { nombre: 'Junio', codigo: 6 },
  { nombre: 'Julio', codigo: 7 },
  { nombre: 'Agosto', codigo: 8 },
  { nombre: 'Septiembre', codigo: 9 },
  { nombre: 'Octubre', codigo: 10 },
  { nombre: 'Noviembre', codigo: 11 },
  { nombre: 'Diciembre', codigo: 12 },
];

export const getCurrentYear = (): number => {
  const currentDate = new Date();
  return currentDate.getFullYear();
};
