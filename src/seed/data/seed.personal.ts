// import * as faker from 'faker';
import { faker } from '@faker-js/faker';
import { IPersonal } from 'src/personal/interfaces/personal.interface';
// import IPersonal



const generateUniqueNumericStrings = (count: number, length = 4): Set<string> => {
	const uniqueNumbers = new Set<string>();

	while (uniqueNumbers.size < count) {
		const randomStr = faker.string.numeric(length);
		uniqueNumbers.add(randomStr);
	}

	return uniqueNumbers;
};

const uniqueNumbers = generateUniqueNumericStrings(30, 5);

const nationalities = [
	'Bolivia',
	'Peru',
	'Chile',
	'Argentina',
	'Brasil',
	'Colombiana',
	'Uruguay'
];

const getRandomNationality = () => {
	const randomIndex = Math.floor(Math.random() * nationalities.length);
	return nationalities[randomIndex];
};

const unitys = [
	'64ef3986f79ba38ee49b21a0',
	'64ef3986f79ba38ee49b21a6',
	'64ef3986f79ba38ee49b21a3',
];

const generateRandomUnitys = () => {
	const randomIndex = Math.floor(Math.random() * unitys.length);
	return unitys[randomIndex]
}

const charges = [
	'655e6f7c3b3d53788ead9190',
	'655e6fa03b3d53788ead9195',
	'655e6fc03b3d53788ead9198',
]

const generateRandomCharge = () => {
	const randomIndex = Math.floor(Math.random() * charges.length)
	return charges[randomIndex];
}

const schedules = [
	'655e70193b3d53788ead91a6',
]		

const generateRandomSchedule = () => {
	const randomIndex = Math.floor(Math.random() * schedules.length)
	return schedules[randomIndex]
}



export const generatePersonnelData = (): IPersonal[] => {
	const personnel = [];
	const uniqueNumbersArray = [...uniqueNumbers];

	for (let i = 0; i < 30; i++) {
		const name = faker.person.firstName();
		const lastName = faker.person.lastName();
		const gender = faker.person.gender();
		const ci = uniqueNumbersArray[i];
		const emailLocalPart = `${name}.${lastName}.${ci}`.toLowerCase().replace(/\s+/g, '');
		const email = `${emailLocalPart}@example.fakerjs.dev`;
		const phone = faker.phone.number()
		const address = faker.location.streetAddress()
		const nationality = getRandomNationality()
		const unity = generateRandomUnitys()
		const charge = generateRandomCharge()
		const schedule = generateRandomSchedule()

		const person = {
			name,
			lastName,
			gender,
			ci,
			email,
			phone,
			address,
			nationality,
			unity,
			charge,
			file: '',
			schedule,
			level: '1',
			isActive: true
		};
		personnel.push(person);
	}

	return personnel;
};
