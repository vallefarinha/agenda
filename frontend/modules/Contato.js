import validator from 'validator';

export default class Contato {
    constructor(formClass) {
        this.form = document.querySelector(formClass);
    }

    init() {
        this.events();
    }

    events() {
        if (!this.form) return;
        this.form.addEventListener('submit', e => {
            e.preventDefault();
            this.validate();
        });
    }          
    
    criaP() {
        const p = document.createElement('p');
        return p;
    }

    validate(e) {
        const el = e.target;
        const nomeInput = el.querySelector('input[name="nome"]');
        const emailInput = el.querySelector('input[name="email"]');
        const telefoneInput = el.querySelector('input[name="telefone"]')
        let error = false;
        const paragrafo = this.criaP();

        if (!nomeInput.value) {
        paragrafo.innerText = "Nome é um campo obrigatório";  
        nomeInput.appendChild(paragrafo);
        error = true;
        }

        if (emailInput.value && !validator.isEmail(emailInput.value)) {
            paragrafo.innerText = "E-mail inválido";  
            emailInput.appendChild(paragrafo);
            error = true;
        }
       
        if (!emailInput.value && !telefoneInput.value) {
            paragrafo.innerText = "'Pelo menos um contato precisa ser enviado: e-mail ou telefone.'";  
            emailInput.appendChild(paragrafo) && telefoneInput.appendChild(paragrafo);
            error = true;
        }    

        if (!error) {
            el.submit();
        }
    }
}