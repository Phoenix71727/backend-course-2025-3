// Підключаю вбудований модуль fs у Node.js для роботи з файловою системою
const fs = require('fs');
// Підключаю встановлену бібліотеку commander для роботи з аргументами командного рядка
const {program} = require('commander');

// Описую опції (параметри), які може приймати наша програма
program
  .requiredOption('-i, --input <type>', 'шлях до вхідного файлу (обов\'язковий параметр)')
  .option('-o, --output [type]', 'шлях до файлу для збереження результату')
  .option('-d, --display', 'вивести результат у консоль')
  .option('-c, --cylinders', 'відображати кількість циліндрів (поле cyl)')
  .option('-m, --mpg <number>', 'відображати лише машини з mpg нижче зазначеного');

// Парсимо аргументи, передані при запуску програми
program.parse(process.argv);
// Отримую об'єкт з опціями, які передав користувач
const options = program.opts();

// Перевіряю наявність обов'язкового параметра --input
if (!options.input) {
  // Виводжу текст помилки згідно з вимогами
  console.error('Error: Please, specify input file');
  // Зупиняю виконання програми з кодом помилки
  process.exit(1);
}

// Перевіряю, чи існує вхідний файл
try {
  // fs.accessSync перевіряє доступність файлу. Якщо його немає, вона викидає помилку.
  fs.accessSync(options.input, fs.constants.R_OK);
} catch (error) {
  // Виводжу текст помилки згідно з вимогами
  console.error(`Error: Cannot find input file`);
  process.exit(1);
}



try {
  // Читаю вхідний JSON файл
  const fileContent = fs.readFileSync(options.input, 'utf8');
  // Парсю JSON в масив об'єктів
  let cars = JSON.parse(fileContent);

  // Фільтрую дані, якщо вказана опція --mpg
  
  if (options.mpg) {
    // Перетворюю вхідне значення mpg в число для коректного порівняння
    const maxMpg = parseFloat(options.mpg);
    if (isNaN(maxMpg)) {
      console.error('Error: Invalid mpg value. Please provide a valid number.');
      process.exit(1);
    }
    // Залишаю в масиві тільки ті машини, у яких mpg менше за вказане
    cars = cars.filter(car => car.mpg < maxMpg);
  }

 const formattedStrings = cars.map(car => {
    // Починаю рядок з моделі машини, яка виводиться завжди
    let outputString = `${car.model}`;

    // Додаю кількість циліндрів, якщо вказана опція --cylinders
    if (options.cylinders) {
      outputString += ` ${car.cyl}`;
    }

    // Завжди додаю паливну економність в кінці рядка
    outputString += ` ${car.mpg}`;

    return outputString;
  });

  // Об'єдную всі відформатовані рядки в один великий текст
  const result = formattedStrings.join('\n');

  // Якщо не задано ні --display, ні --output, виводжу інформаційне повідомлення
  if (!options.display && !options.output) {
      console.log('Дані оброблено. Для виводу використовуйте --display або --output.');
  }

  // Виводжу результат в консоль, якщо є прапорець --display
  if (options.display) {
    console.log(result);
  }

  // Записую результат у файл, якщо є прапорець --output
  if (options.output) {
    try {
      fs.writeFileSync(options.output, result, 'utf8');
      console.log(`Результат успішно збережено у файл: ${options.output}`);
    } catch (error) {
      console.error('Error: Cannot write to output file');
      process.exit(1);
    }
  }

} catch (error) {
  console.error('Сталася помилка під час обробки файлу:', error.message);
  process.exit(1);
}

