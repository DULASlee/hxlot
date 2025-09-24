/// <reference types="cypress" />

describe('SmartAbp API Integration Tests', () => {
  const API_BASE_URL = Cypress.config('baseUrl') || 'https://localhost:44379';
  let authToken: string | null = null;

  beforeEach(() => {
    // Enterprise login to get the token before each test
    cy.request({
      method: 'POST',
      url: `${API_BASE_URL}/connect/token`,
      form: true,
      body: {
        grant_type: 'password',
        username: 'admin', // Standard test user
        password: '1q2w3E*', // Standard test password
        client_id: 'SmartAbp_App',
        scope: 'SmartAbp',
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('access_token');
      authToken = response.body.access_token;
    });
  });

  context('User Profile and Authentication API', () => {
    it('should successfully fetch user profile with a valid token', () => {
      expect(authToken).to.not.be.null;

      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/api/account/my-profile`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('userName', 'admin');
        expect(response.body).to.have.property('email');
      });
    });

    it('should fail to fetch user profile without a token', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/api/account/my-profile`,
        failOnStatusCode: false, // Prevent Cypress from failing the test on 4xx/5xx
      }).then((response) => {
        // Expect a redirect to the login page for unauthorized access
        expect(response.status).to.eq(302);
      });
    });

    it('should fail to fetch user profile with an invalid token', () => {
      const invalidToken = 'this-is-an-invalid-token';
      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/api/account/my-profile`,
        headers: {
          Authorization: `Bearer ${invalidToken}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        // ABP returns 302 for invalid tokens in this setup
        expect(response.status).to.eq(302);
      });
    });
  });

  context('Application Configuration API', () => {
    it('should fetch application configuration successfully', () => {
      expect(authToken).to.not.be.null;

      cy.request({
        method: 'GET',
        url: `${API_BASE_URL}/api/abp/application-configuration`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('auth');
        expect(response.body).to.have.property('currentUser');
        expect(response.body.currentUser).to.have.property('isAuthenticated', true);
        expect(response.body.currentUser).to.have.property('userName', 'admin');
      });
    });
  });

  // Add more tests for other critical APIs as needed
});
