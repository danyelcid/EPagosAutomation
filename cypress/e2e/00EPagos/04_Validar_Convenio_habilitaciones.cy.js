/// <reference types="cypress" />

beforeEach('Iniciar sesión en el ambiente', () => {
    cy.fixture('credenciales').then((credenciales) => {
        cy.login(credenciales.usuario, credenciales.clave, credenciales.ambiente)
    })
})


it('Verificar convenio creado y sus habilitaciones', () => {

    cy.fixture('datosConvenio').then((data) => {
        cy.safeType('[name="tabla:table:iterHead:0:headerColumn:filtro"]', data.comercio)

        cy.get('a').contains('epagos:comercio:' + data.comercio).click().wait(1000)
        cy.wait(1000)
        cy.get('a').contains(data.comercio).click()

        cy.safeType('[name="panelPrincipal:convenios:table:iterHead:0:headerColumn:filtro"]', data.convenio)

        cy.get('a').contains('epagos:convenio:' + data.comercio + ':' + data.convenio).click()
        cy.wait(1000)
        cy.get('a').contains('epagos:convenio:' + data.comercio + ':' + data.convenio).click()

        //verificar datos cargados
        cy.get('#habilitado').should(data.habilitado ? 'be.checked' : 'not.be.checked')

        cy.get('label').contains(`epagos:comercio:${data.comercio}`).should('exist');
        cy.get('label').contains(`epagos:convenio:${data.comercio}:${data.convenio}`).should('exist');

        cy.get('input#nombre').should('have.value', data.nombre)
        cy.get('input#descripcionConvenio').should('have.value', data.nombre)

        cy.get('#idConvenioRc').should('have.value', data.idConvenioRc ? data.idConvenioRc : '')
        cy.get('#marcaTalonRC').should(data.marcaTalon ? 'be.checked' : 'not.be.checked')
        cy.get('#permiteAnulacionBackoffice').should(data.permiteAnulacion ? 'be.checked' : 'not.be.checked')
        cy.get('#procesarCodigoDeBarras').should(data.procesarCodigoBarras ? 'be.checked' : 'not.be.checked')
        cy.get('#notificarTransaccionesConciliacion').should(data.notificarTransaccionesConciliacion ? 'be.checked' : 'not.be.checked')

        cy.get('select[name="panelPrincipal:tipoDeVolcado:select"]  option[selected]').should('have.text', data.tipoVolcado)
        cy.get('#codigoGwHg').should('have.value', data.codigoVolcado ? data.codigoVolcado : '')
        /**
         * Faltan campos:
         * - conceptoPrincipal
         * - esta funcionalidad no esta disponible en el ambiente de prep, por lo que no se pueden cargar datos para verificar
         * - cy.get('#conceptoPrincipal').should('have.value', data.conceptoPrincipal ? data.conceptoPrincipal : '' )
         */

        cy.get('#comision').should('have.value', data.comisionEPagos)
        data.monedas.forEach(moneda => {
            cy.get('.ap-agregarLista .ap-orderedTable').should('contain', moneda)
        })

        cy.wrap(data.habilitaciones).each((habilitacion) => {
            const nombre = habilitacion.mpConector.split(':').pop()
            cy.contains('label', `epagos:habilitacionprocesador:${data.comercio}:${data.convenio}_web:${nombre}`)
                .should('exist')
                .click();

            if (habilitacion.atributos) {
                cy.get('a label').contains('Interfaz MP').click()
                cy.contains('label', "Listado de medios de pago conectores asociados")
                    .should('exist')
                    .should('be.visible');

                if (nombre != 'banred') {
                    cy.contains('tr', `ID_BANCO`).should('exist').and('contain', habilitacion.idBanco)
                }
                cy.contains('tr', `ID_ORGANISMO`).should('exist').and('contain', data.idOrganismo)
                cy.contains('tr', `NUMERO_CONVENIO`).should('exist').and('contain', data.numeroConvenio)
            }

            cy.get('a label').contains('Comisión').click()

            if (nombre != 'urupago') {
                cy.get('[name="panelPrincipal:carrito:contenido:2:contenidoContainer:panelContenido:comisiones"]')
                    .should('exist')
                    .should('be.visible')
                    .should('have.value', data.comisionMP)
            } else {
                cy.get('[name="panelPrincipal:carrito:contenido:2:contenidoContainer:panelContenido:comisiones"]')
                    .should('exist')
                    .should('be.visible')
                    .should('have.value', data.comisionUrupago)
            }
            cy.get('[name="panelPrincipal:carrito:contenido:2:contenidoContainer:panelContenido:conceptos"]')
                .should('exist')
                .should('be.visible')
                .should('have.value', habilitacion.conceptoMP)

            cy.get('[name="panelPrincipal:carrito:contenido:2:contenidoContainer:panelContenido:ordinalComision"]')
                .should('exist')
                .should('be.visible')
                .should('have.value', habilitacion.ordinal)
            cy.contains('a', 'Volver').click();
        })

    })

})