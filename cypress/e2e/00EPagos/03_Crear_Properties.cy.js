/// <reference types="cypress" />

beforeEach('Iniciar sesión en el ambiente', () => {
    cy.fixture('credenciales').then((credenciales) => {
        cy.login(credenciales.usuario, credenciales.clave, credenciales.ambiente)
    })
})

it('Crear las properties del concepto y convenio las valida despues de creadas', () => {
    cy.fixture('tipoDNC').then((data) => {
        cy.contains('a', 'Properties')
            .should('be.visible')
            .click()
        //properties del concepto
        //Si el convenio es de tipo Timbre Digital, no se debe crear properties del concepto 
        //porque se usa un concepto ya existente para todos los convenios de este tipo, 
        // por lo que solo se crean properties del convenio

        if (!data.tipoTimbreDigital) {
            cy.get('a').contains('Nueva').click()
            cy.safeType('input[name="panelPrincipal:codigo"]', `epagos:concepto:${data.comercio}:${data.convenio}`)
            cy.get('select[name="panelPrincipal:modulo:select"]').select('EPAGOS')
            cy.safeType('input[name="panelPrincipal:descripcion"]', 'Código de volcado')
            cy.safeType('input[name="panelPrincipal:valor"]', data.desglose)
            cy.get('a').contains('+').click()
            cy.get('.ap-orderedTable').should('contain', `${data.desglose}`)

            cy.safeType('textarea[name="comentario"]', `Se agrega el codigo de volcado para el concepto ${data.comercio} - ${data.nombre}`)

            cy.get('a').contains('Guardar').click()

            cy.contains('.modal.fade.in a label', 'Si').last().then((element) => {
                cy.wrap(element).click({ force: true })
            })

            cy.safeType('input[name="tabla:table:iterHead:0:headerColumn:filtro"]', `epagos:concepto:${data.comercio}:${data.convenio}`)
            cy.get('.ap-orderedTable tbody tr')
                .should('contain', `epagos:concepto:${data.comercio}:${data.convenio}`)
                .should('contain', `${data.desglose}`)
                .should('contain', 'EPAGOS')
                .should('exist');
        }

        //properties del convenio
        cy.get('a').contains('Nueva').click()
        cy.safeType('input[name="panelPrincipal:codigo"]', `epagos:convenio:${data.comercio}:${data.convenio}`)
        cy.get('select[name="panelPrincipal:modulo:select"]').select('EPAGOS')
        cy.safeType('input[name="panelPrincipal:descripcion"]', 'Código de volcado')
        cy.safeType('input[name="panelPrincipal:valor"]', data.codigoVolcado)
        cy.get('a').contains('+').click()
        cy.get('.ap-orderedTable').should('contain', `${data.codigoVolcado}`)

        cy.safeType('textarea[name="comentario"]', `Se agrega el codigo de volcado para el convenio ${data.comercio} - ${data.nombre}`)

        cy.get('a').contains('Guardar').click()
        cy.contains('.modal.fade.in a label', 'Si').last().then((element) => {
            cy.wrap(element).click({ force: true })
        })
        cy.safeType('input[name="tabla:table:iterHead:0:headerColumn:filtro"]', `epagos:convenio:${data.comercio}:${data.convenio}`)
        cy.get('.ap-orderedTable tbody tr')
            .should('contain', `epagos:convenio:${data.comercio}:${data.convenio}`)
            .should('contain', `${data.codigoVolcado}`)
            .should('contain', 'EPAGOS')
            .should('exist');
    })
})
