/// <reference types="cypress" />


it('Crear nuevo convenio', () => {


    cy.fixture('datosConvenio').then((data) => {
        let ambiente = data.ambiente

        cy.fixture('credenciales').then((credenciales) => {
            cy.login(credenciales.usuario, credenciales.clave, ambiente)
        })

        cy.contains('Comercios').click()
        //filtar comercio y entrar al comercio
        cy.safeType('input[name="tabla:table:iterHead:0:headerColumn:filtro"]', data.comercio)

        cy.get('a').contains('epagos:comercio:' + data.comercio).click()
        cy.wait(1000)
        cy.get('a').contains('epagos:comercio:' + data.comercio).click()

        //buscar el convenio y se asegura que no exista antes de crearlo
        cy.safeType('[name="panelPrincipal:convenios:table:iterHead:0:headerColumn:filtro"]', data.convenio, { delay: 15 })
        cy.contains('label', `epagos:convenio:${data.comercio}:${data.convenio}`).should('not.exist')

        cy.get('a').contains('Agregar Convenio').click()

        //Configurar datos cargados desde el JSON
        cy.setCheckbox('[name="panelPrincipal:habilitado"]', data.habilitado)
        cy.get('[name="panelPrincipal:habilitado"]').should(data.habilitado ? 'be.checked' : 'not.be.checked');

        cy.safeType('input#sufijoCodigo', data.convenio, { delay: 15 })
        cy.safeType('input#nombre', data.nombre, { delay: 15 })
        cy.safeType('input#descripcionConvenio', data.nombre, { delay: 15 })

        data.idConvenioRc ? cy.safeType('#idConvenioRc', data.idConvenioRc) : null
        cy.setCheckbox('#marcaTalonRC', data.marcaTalon)
        cy.setCheckbox('#permiteAnulacionBackoffice', data.permiteAnulacion)
        cy.setCheckbox('#procesarCodigoDeBarras', data.procesarCodigoBarras)
        cy.setCheckbox('#notificarTransaccionesConciliacion', data.notificarTransaccionesConciliacion)

        //Concepto Principal para cuando este subida la funcionalidad en GUI con release correspondiente
        //data.conceptoPrincipal ? cy.safeType('#conceptoPrincipal', data.conceptoPrincipal) : null

        cy.get('select[name="panelPrincipal:tipoDeVolcado:select"] option').contains(data.tipoVolcado)
            .invoke('val')
            .as('vtipoVolcado')

        cy.get('@vtipoVolcado').then((value) => {
            cy.get('select[name="panelPrincipal:tipoDeVolcado:select"]').select(value)
        })

        if (data.tipoVolcado === 'VOLCAR_CON_COMISIONES') {
            cy.safeType('input#codigoGwHg', data.codigoVolcado)
        }

        cy.safeType('input#comision', data.comisionEPagos, { delay: 15 })
        cy.get('div#comision-autocomplete-container').should('be.visible').contains(data.comisionEPagos).click()

        data.monedas.forEach(moneda => {
            cy.get('[name="panelPrincipal:monedas:elemento:select"] option').contains(moneda)
                .invoke('val')
                .as('monedaValue')

            cy.get('@monedaValue').then((value) => {
                cy.get('[name="panelPrincipal:monedas:elemento:select"]').select(value)
            })
            cy.get('.ap-agregarLista').contains('Agregar').click()
        })

        cy.safeType('textarea[name="comentario"]', 'Creacion de convenio ' + data.convenio + ' con nombre ' + data.nombre)
        cy.get('a').contains('Guardar').click()

        cy.contains('.modal.fade.in a label', 'Si').last().then((element) => {
            cy.wrap(element).click({ force: true })
        })
        //validar que el convenio se haya creado
        cy.safeType('[name="panelPrincipal:convenios:table:iterHead:0:headerColumn:filtro"]', 'epagos:convenio:' + data.comercio + ':' + data.convenio)
        cy.get('tr').filter(':contains("Convenios")').should('contain', 'epagos:convenio:' + data.comercio + ':' + data.convenio)

    })

})





