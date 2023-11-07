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

const uniqueNumbers = generateUniqueNumericStrings(50000, 5);

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
	'652fe36062c829c3211b1923',
	'652fe37462c829c3211b1925',
	'652fe38462c829c3211b1927',
]

const generateRandomCharge = () => {
	const randomIndex = Math.floor(Math.random() * charges.length)
	return charges[randomIndex];
}

const schedules = [
	'6540350dbdbea3f0cdff27f6',
	'65403543bdbea3f0cdff27f9',
	'65403552bdbea3f0cdff27fc'
]		

const generateRandomSchedule = () => {
	const randomIndex = Math.floor(Math.random() * schedules.length)
	return schedules[randomIndex]
}

export const generatePersonnelData = (): IPersonal[] => {
	const personnel = [];
	const uniqueNumbersArray = [...uniqueNumbers];

	for (let i = 0; i < 50000; i++) {
		const name = faker.person.firstName();
		const lastName = faker.person.lastName();
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
			ci,
			email,
			phone,
			address,
			nationality,
			unity,
			charge,
			file: '',
			schedule,
			isActive: true
		};
		personnel.push(person);
	}

	return personnel;
};
