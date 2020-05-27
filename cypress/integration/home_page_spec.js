describe('The Home Page', () => {
  it('successfully loads', () => {
    cy.visit('http://localhost:3000') // change URL to match your dev URL
  })

  it ('Renders the title', () => {
    cy.get('h1').contains('BabyFoot Manager')
  })

  it ('Creates a game', () => {
    cy.get('input').first().type('CypressPlayer1')
    cy.get('input').last().type('CypressPlayer2')
    cy.get('button').click()
    cy.wait(100)
    cy.get('li').first().contains('CypressPlayer1 vs CypressPlayer2')
  })
})