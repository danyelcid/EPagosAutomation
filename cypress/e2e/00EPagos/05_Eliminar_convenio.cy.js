/// <reference types="cypress" />


it('Eliminar convenio y sus habilitaciones', () => {


    cy.fixture('datosConvenio').then((data) => {
        let ambiente = data.ambiente

        cy.fixture('credenciales').then((credenciales) => {
            cy.login(credenciales.usuario, credenciales.clave, ambiente)
        })

        cy.contains('Comercios').click()

        cy.safeType('[name="tabla:table:iterHead:0:headerColumn:filtro"]', data.comercio, { delay: 15 })

        cy.get('a').contains('epagos:comercio:' + data.comercio).click().wait(1000)
        cy.wait(1000)
        cy.get('a').contains(data.comercio).click()

        cy.safeType('[name="panelPrincipal:convenios:table:iterHead:0:headerColumn:filtro"]', data.convenio, { delay: 15 })

        cy.get('a').contains('epagos:convenio:' + data.comercio + ':' + data.convenio).click()
        cy.wait(1000)
        cy.get('a').contains('epagos:convenio:' + data.comercio + ':' + data.convenio).click()
        //deshabilitar las habilitaciones
        cy.contains('div', 'Habilitaciones')
            .find('table').find('thead').find('tr').find('input[type="checkbox"]')
            .should('be.visible')
            .check()

        cy.contains('a', 'Deshabilitar')
            .click();

        cy.get('.modal.fade.in').contains('a label', 'Si').then((element) => {
            cy.wrap(element).click({ force: true });

        })
        cy.wait(5000)


        cy.fixture(`${ambiente}/mediosPago`).then((mediosPago) => {
            cy.wrap(mediosPago.habilitaciones).each((habilitacion) => {

                const nombre = habilitacion.mpConector.split(':').pop()

                cy.contains('label', `epagos:habilitacionprocesador:${data.comercio}:${data.convenio}_web:${nombre}`)
                    .should('exist');

                cy.contains('label', `epagos:habilitacionprocesador:${data.comercio}:${data.convenio}_web:${nombre}`)
                    .closest('tr')
                    .contains('a', 'Borrar')
                    .click()


                cy.get('.modal.fade.in').contains('a label', 'Si').then((element) => {
                    cy.wrap(element).click({ force: true });

                })
            })
        })

        cy.contains('a', 'Volver').click()
        cy.safeType('[name="panelPrincipal:convenios:table:iterHead:0:headerColumn:filtro"]', data.convenio, { delay: 15 })

        cy.get('a').contains('epagos:convenio:' + data.comercio + ':' + data.convenio)
            .should('exist')
            .should('have.length', 1) // Asegura que solo exista un convenio con ese nombre

        cy.get('a').contains('epagos:convenio:' + data.comercio + ':' + data.convenio).click()

        cy.wait(1000)

        cy.contains('a label', 'Quitar')
            .click()

        cy.get('.modal.fade.in').contains('a label', 'Si').then((element) => {
            cy.wrap(element).click({ force: true });
        })

    })


})