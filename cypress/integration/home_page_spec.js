describe('The Home Page', () => {
  it('successfully loads', () => {
    cy.visit('http://localhost:3000') // change URL to match your dev URL
  })

  it ('Renders the title', () => {
    cy.get('h1').contains('BabyFoot Manager')
  })

  it ('Creates a game', () => {
    cy.get('#newGame input').first().type('CypressPlayer1')
    cy.wait(100)
    cy.get('#newGame input').last().type('CypressPlayer2')
    cy.get('button').click()
    cy.wait(100)
    cy.get('#gameList').get('li').find('span').first().contains('CypressPlayer1 vs CypressPlayer2')
  })

  it ('Finishes a game and sets a score', () => {
    cy.get('#gameList').get('li').find('input').eq(0).type(4)
    cy.get('#gameList').get('li').find('input').eq(1).type(5)
    cy.get('#gameList').get('li').find('input').eq(2).check()
    cy.wait(100)
    cy.get('#gameList').get('li').find('input').eq(0).should('have.value', '4')
    cy.get('#gameList').get('li').find('input').eq(1).should('have.value', '5')
  })

  it ('Sends a message', () => {
    cy.get('#chat .playerSearch input').first().type('CypressMessager{enter}')
    cy.wait(100)
    cy.get('#messageBox').type('Cypress test message{enter}')
    cy.get('#chat > ul li').last().contains(' : Cypress test message')
  })

  it ('Opens and closes the menu', () => {
    cy.viewport(500, 600)
    cy.get('#menu').click()
    cy.get('#menu ul').should('be.visible')
    cy.get('#menu').click()
    cy.get('#menu ul').should('not.be.visible')
  })

  it ('Displays the chat', () => {
    cy.viewport(500, 600)
    cy.get('#menu').click()
    cy.get('#menu ul li').last().click()
    cy.get('#chat').should('be.visible')
    cy.get('#gameBoard').should('not.be.visible')
    cy.get('#menu ul').should('not.be.visible')
  })

  it ('Displays the games', () => {
    cy.viewport(500, 600)
    cy.get('#menu').click()
    cy.get('#menu ul li').first().click()
    cy.get('#chat').should('not.be.visible')
    cy.get('#gameBoard').should('be.visible')
    cy.get('#menu ul').should('not.be.visible')
  })
})
