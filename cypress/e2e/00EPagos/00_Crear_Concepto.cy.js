/// <reference types="cypress" />

beforeEach('Iniciar sesión en el ambiente', () => {
    cy.fixture('credenciales').then((credenciales) => {
        cy.login(credenciales.usuario, credenciales.clave, credenciales.ambiente)
    })
})

it('Crear concepto asociado al convenio y valida despues de creado', () => {
    cy.fixture('datosConvenio').then((data) => {
        if (!data.tipoTimbreDigital) {
            cy.contains('a', 'Conceptos').click()

            cy.contains('a', 'Nueva')
                .should('be.visible')
                .click()

            cy.setCheckbox('[name="panelPrincipal:habilitado"]', true)
            cy.safeType('input[name="panelPrincipal:contenidoSufijo:sufijo"]', `${data.comercio}:${data.convenio}`)
            cy.safeType('input[name="panelPrincipal:nombre"]', `Concepto ${data.comercio} - ${data.nombre}`)
            cy.safeType('input[name="panelPrincipal:descripcion"]', `Concepto ${data.comercio} - ${data.nombre}`)
            cy.safeType('input[name="panelPrincipal:codigoGwHg"]', data.desglose)

            cy.safeType('textarea[name="comentario"]', 'Se crea el concepto para el convenio ' + data.nombre)

            cy.get('a').contains('Guardar').click()

            cy.contains('.modal.fade.in a label', 'Si').last().then((element) => {
                cy.wrap(element).click({ force: true })
            })
            cy.safeType('input[name="tabla:table:iterHead:0:headerColumn:filtro"]', `epagos:concepto:${data.comercio}:${data.convenio}`)

            cy.get('label').contains(`epagos:concepto:${data.comercio}:${data.convenio}`)
                .should('exist')

            cy.safeType('input[tabla:table:iterHead:0:headerColumn:filtro]', `epagos:concepto:${data.comercio}:${data.convenio}`)
            cy.get('.ap-orderedTable tbody tr')
                .should('contain', `epagos:concepto:${data.comercio}:${data.convenio}`)
                .should('contain', `${data.desglose}`)
                .should('contain', 'EPAGOS')
                .should('exist');
        }
    })
})
