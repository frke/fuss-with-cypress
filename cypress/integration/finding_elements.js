/// <reference types="cypress" />

describe('FINDING ELEMENTS', function () {

	it('Test', function () {

		cy.visit('/');

		cy.log('🔎 TAGNAME')
		cy.get('input'); // by Tagname

		cy.log('🔎 ID')
		cy.get('#username'); // by Id

		cy.log('🔎 CLASSNAME')
		cy.get('.MuiInputBase-input'); // by Class name
		cy.get('.MuiTypography-h5'); // by Class name

		cy.log('🔎 ATTRIBUTE NAME')
		cy.get('[data-shrink]'); // by attribute name

		cy.log('🔎 ATTRIBUTE NAME AND VALUE')
		cy.get('[data-shrink=true]'); // by Attribute name and Value

		cy.log('🔎 CLASS VALUE ⚠️ Quotes are mandatory!')
		cy.get('[class="MuiInputBase-input MuiOutlinedInput-input"]'); // by Class Value

		cy.log('🔎 TAG NAME AND ATTRIBUTE=VALUE')
		cy.get('div[data-test=signin-password]');  // by Tag name and Attribute=value

		cy.log('🔎 TWO DIFFERENT ATTRIBUTES')
		cy.get('[name=remember][type]'); // by 2 different Attributes

		cy.log('🔎 TAGNAME, ATTRIBUTE=VALUE, ID, CLASS NAME')
		cy.get('input[name=password]#password.MuiInputBase-input'); // by Tagname, Attribute=value, Id and Class name

		cy.log('🔎 CONTAINING TEXT')
		cy.contains('Don\'t have an account?') // by containing text
		cy.contains('Sign')

		cy.log('🔎 SPECIFIC ELEMENT CONTAINING TEXT')
		cy.contains('span', 'Sign') // by specific element containing text
		cy.contains('h1', 'Sign')
		cy.contains('a', 'Sign Up')

		cy.log('🔎 ELEMENTS INSIDE OTHER ELEMENT')
		cy.get('form').within(() => {
			cy.get('#username')
			cy.get('#password')
		})
		cy.get('form').find('[type=checkbox]') // elements inside other element

		cy.log('🔎 ELEMENTS WITH data-test SELECTOR LIKE...')
		cy.get('[data-test*=gnin-userna]') // elements with data-test selector like...

		cy.log('🔎 CSS SELECTOR CONSTRUCTION')
		cy.get('.MuiContainer-root > .MuiTypography-root') // css selector construction

	});

});