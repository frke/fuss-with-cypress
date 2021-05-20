/// <reference type="cypress"/>

describe('PICK RANGE DATE', () => {

	beforeEach(function () {
		cy.loginByXstate('Katharina_Bernier')
	})

	it('🗓 Date-Picker example', () => {

		const dateRangeStart = new Date('2021-05-19T20:35:48.390Z');
		const dateRangeEnd = new Date('2021-05-24T20:35:48.390Z');

		cy.pickDateRange(dateRangeStart, dateRangeEnd)
	});

})