describe('Onboarding - New Install', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api').as('api')
  })

  describe('Blank database, no users.', () => {
    it(`Redirects.
- All URLs redirect to create a new account.`, () => {
      const urls = [
        '/',
        '/u/username/account',
        '/u/username',
        '/u/username/libraryId',
        '/login',
      ]

      urls.forEach((url) => {
        cy.visit(url)

        cy.location('pathname').should('equal', '/account/new')
      })
    })

    it(`No navigation.`, () => {
      cy.visit('/account/new')

      cy.get('[data-test=Navigation] > *').should('not.exist')
    })

    it.skip(`Duplicate usernames are not allowed.`, () => {
      cy.request('POST', 'http://localhost:3000/api', {
        query: `mutation signUp($input: SignUpInput!) {
                   signUp(input: $input) {
                    user {
                      id
                      username
                      isAuthenticated
                    }
                  }
                }`,
        variables: {
          input: {
            name: 'Test User',
            username: 'test',
            email: 'test@example.com',
            password: 'test',
            passwordConfirmation: 'test',
          },
        },
      })

      cy.intercept('POST', 'http://localhost:3000/api', (req) => {
        req.continue((res) => {
          expect(res.statusCode).to.equal(400)
          expect(res.body.errors.length).to.equal(1)
          expect(res.body.errors?.[0].message).to.equal(
            'Email is already in use.',
          )
        })
      }).as('signUp')
      cy.visit('/account/new')
      cy.get('form[data-name="registration"]').as('registrationForm')
      cy.get('@registrationForm')
        .find('input[name="email"]')
        .type('test@example.com')
      cy.get('@registrationForm').find('input[name="username"]').type('test')
      cy.get('@registrationForm').find('input[name="name"]').type('Test User')
      cy.get('@registrationForm').find('input[name="password"]').type('test')
      cy.get('@registrationForm')
        .find('input[name="passwordConfirmation"]')
        .type('test')
      cy.get('@registrationForm').find('button[type="submit"]').click()
      cy.get('@signUp')

      cy.get('.MuiSnackbar-root').contains('Email is already in use.')
      cy.pause()
    })
  })

  it(`Account creation works.`, () => {
    cy.visit('/account/new')

    cy.get('form[data-name="registration"]').as('registrationForm')
    cy.get('@registrationForm')
      .find('input[name="email"]')
      .type('test@example.com')
    cy.get('@registrationForm').find('input[name="username"]').type('test')
    cy.get('@registrationForm').find('input[name="name"]').type('Test User')
    cy.get('@registrationForm').find('input[name="password"]').type('test')
    cy.get('@registrationForm')
      .find('input[name="passwordConfirmation"]')
      .type('test')
    cy.get('@registrationForm').find('button[type="submit"]').click()

    cy.wait<any, { data: { signUp: { user: { id: string } } } }>('@api').then(
      (intercept) => {
        cy.location('pathname').should(
          'equal',
          `/u/${intercept.response?.body.data.signUp.user.id}/account`,
        )
      },
    )
  })

  describe('After first account created', () => {
    it(`Navigation is shown.`, () => {
      cy.task('seedUsers')
      cy.visit('/account/new')

      cy.get('[data-test=Navigation] > *').should('exist')
    })
  })
})
