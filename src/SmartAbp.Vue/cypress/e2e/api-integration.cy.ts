const API_BASE = Cypress.env('API_BASE') || 'http://localhost:3000/api'

describe('API Integration Tests', () => {
  beforeEach(() => {
    // Setup API authentication
    cy.window().then((win) => {
      win.localStorage.setItem('access_token', 'test-token-123')
      win.localStorage.setItem('refresh_token', 'refresh-token-456')
    })
  })

  describe('Performance and Load Testing', () => {
    it('should handle large dataset requests efficiently', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/security/dashboard/alerts`,
        headers: {
          'Authorization': 'Bearer ' + window.localStorage.getItem('access_token')
        }
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.alerts.length).to.be.lessThan(101)
        
        // Response should be optimized for large datasets
        expect(response.headers['content-encoding']).to.include('gzip')
      })
    })
  })

  describe('Security and Authentication', () => {
    
    describe('JWT Token Validation', () => {
      it('should validate JWT token expiration', () => {
        // Use expired token
        const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.token'
        
        cy.request({
          method: 'GET',
          url: `${API_BASE}/security/dashboard/metrics`,
          headers: {
            'Authorization': `Bearer ${expiredToken}`
          },
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(401)
          expect(response.body.error).to.eq('Token Expired')
        })
      })

      it('should validate token refresh mechanism', () => {
        // Test token refresh
        cy.request({
          method: 'POST',
          url: `${API_BASE}/auth/refresh-token`,
          headers: {
            'Authorization': 'Bearer ' + window.localStorage.getItem('access_token'),
            'Refresh-Token': window.localStorage.getItem('refresh_token')
          }
        }).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.have.property('accessToken')
          expect(response.body).to.have.property('refreshToken')
          expect(response.body).to.have.property('expiresIn')
        })
      })
    })

    describe('Rate Limiting', () => {
      it('should enforce API rate limits', () => {
        const requests = []
        
        // Make many requests rapidly
        for (let i = 0; i < 100; i++) {
          requests.push(
            cy.request({
              method: 'GET',
              url: `${API_BASE}/security/dashboard/metrics`,
              headers: {
                'Authorization': 'Bearer ' + window.localStorage.getItem('access_token')
              },
              failOnStatusCode: false
            })
          )
        }
        
        Cypress.Promise.all(requests).then((responses) => {
          // Some requests should be rate limited
          const rateLimitedResponses = responses.filter(r => r.status === 429)
          expect(rateLimitedResponses.length).to.be.greaterThan(0)
          
          // Rate limited responses should have proper headers
          rateLimitedResponses.forEach(response => {
            expect(response.headers).to.have.property('x-ratelimit-limit')
            expect(response.headers).to.have.property('x-ratelimit-remaining')
            expect(response.headers).to.have.property('retry-after')
          })
        })
      })
    })
  })

  describe('Cross-Service Integration', () => {
    
    describe('Elasticsearch Integration', () => {
      it('should query audit logs from Elasticsearch', () => {
        cy.request({
          method: 'POST',
          url: `${API_BASE}/audit/search`,
          headers: {
            'Authorization': 'Bearer ' + window.localStorage.getItem('access_token')
          },
          body: {
            query: {
              match: {
                action: 'SECURITY_ALERT_ACKNOWLEDGED'
              }
            },
            from: 0,
            size: 10,
            sort: [{ timestamp: { order: 'desc' } }]
          }
        }).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.have.property('hits')
          expect(response.body.hits).to.have.property('total')
          expect(response.body.hits).to.have.property('hits')
          expect(response.body.hits.hits).to.be.an('array')
        })
      })
    })

    describe('External Service Integration', () => {
      it('should integrate with external notification service', () => {
        cy.request({
          method: 'POST',
          url: `${API_BASE}/notifications/send`,
          headers: {
            'Authorization': 'Bearer ' + window.localStorage.getItem('access_token')
          },
          body: {
            type: 'security-alert',
            recipients: ['admin@smartabp.com'],
            priority: 'High',
            data: {
              alertId: 'alert-001',
              alertType: 'HighRiskPermissionAccess'
            }
          }
        }).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.have.property('notificationId')
          expect(response.body).to.have.property('status', 'sent')
          expect(response.body).to.have.property('deliveryTime')
        })
      })
    })
  })

  describe('Data Export and Reporting', () => {
    
    describe('Export API Functionality', () => {
      it('should export dashboard data in multiple formats', () => {
        const formats = ['pdf', 'excel', 'csv']
        
        formats.forEach(format => {
          cy.request({
            method: 'POST',
            url: `${API_BASE}/security/dashboard/export`,
            headers: {
              'Authorization': 'Bearer ' + window.localStorage.getItem('access_token')
            },
            body: {
              format: format,
              dateRange: '7d',
              sections: ['metrics', 'alerts', 'compliance', 'behaviors']
            }
          }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('exportId')
            expect(response.body).to.have.property('downloadUrl')
            expect(response.body).to.have.property('expiresAt')
            expect(response.body).to.have.property('fileSize')
          })
        })
      })

      it('should generate compliance reports with proper validation', () => {
        cy.request({
          method: 'POST',
          url: `${API_BASE}/reports/compliance/generate`,
          headers: {
            'Authorization': 'Bearer ' + window.localStorage.getItem('access_token')
          },
          body: {
            reportType: 'GDPR_Compliance',
            period: {
              from: '2024-01-01',
              to: '2024-01-31'
            },
            includeRecommendations: true,
            format: 'pdf'
          }
        }).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.have.property('reportId')
          expect(response.body).to.have.property('status', 'processing')
          expect(response.body).to.have.property('estimatedCompletion')
        })
      })
    })
  })

  describe('Health Check and Monitoring', () => {
    
    describe('API Health Endpoints', () => {
      it('should provide comprehensive health check', () => {
        cy.request({
          method: 'GET',
          url: `${API_BASE}/health`,
        }).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.have.property('status', 'healthy')
          expect(response.body).to.have.property('timestamp')
          expect(response.body).to.have.property('services')
          
          // Validate service health
          const services = response.body.services
          expect(services).to.have.property('database')
          expect(services).to.have.property('elasticsearch')
          expect(services).to.have.property('redis')
          expect(services).to.have.property('notifications')
          
          Object.values(services).forEach(service => {
            expect(service).to.have.property('status')
            expect(service).to.have.property('responseTime')
          })
        })
      })

      it('should provide detailed readiness check', () => {
        cy.request({
          method: 'GET',
          url: `${API_BASE}/health/ready`,
        }).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.have.property('ready', true)
          expect(response.body).to.have.property('checks')
          
          response.body.checks.forEach(check => {
            expect(check).to.have.property('name')
            expect(check).to.have.property('status', 'pass')
            expect(check).to.have.property('time')
          })
        })
      })
    })
  })
})