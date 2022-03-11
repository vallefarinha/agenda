//QUEM TRATA DE DADOS É O MODEL
/*O Mongoose fornece um mapeamento de objetos do MongoDB similar ao ORM (Object Relational Mapping), ou ODM (Object Data Mapping) no caso do Mongoose. Isso significa que o Mongoose traduz os dados do banco de dados para objetos JavaScript para que possam ser utilizados por sua aplicação.*/
const mongoose = require('mongoose');
//pacote que valida o e-mail
const validator = require('validator');
const bcryptjs = require('bcryptjs');

//Configuração do model que vai para a base de dados
const LoginSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true }
});

const LoginModel = mongoose.model('Login', LoginSchema);

//esta classe vai pegar DO EXPORTS.REGISTER DO LOGIN CONTROLLER os dados do formulario passados no body (POST) e depois validar
class Login {
    constructor(body) {
        //pega os dados do form. A instanciacao ocorre no loginControl
        this.body = body; 
        this.errors = [];
        this.user = null;
    }

    async login() {
        //chama a função que valida os campos
        this.valida();
        //se o array de erros tiver um elemento, o usuário não vai logar.
        if (this.errors.length > 0) return;
        this.user = await LoginModel.findOne({ email: this.body.email });

        if (!this.user) {
            this.errors.push('Usuário não existe');
            return;
        }

        //o bcrypt fez o hash da senha do usuario. e vamos pedir agora para ele checar a senha
        if(!bcryptjs.compareSync(this.body.password, this.user.password)) {
            this.errors.push('Senha inválida');
            this.user = null;
            return;
          }
        }
    //sempre que se trabalha com base de dados se usa PROMISES. Por isso é async
    async register() {
        //chama a função que valida os campos
        this.valida();        
        //se tiver erro, retorna, para.
        if (this.errors.length > 0) return;

        await this.userExists();

        if (this.errors.length > 0) return;

        /*este metodo gera uma cadeia de caracteres aleatorios*/
        const salt = bcryptjs.genSaltSync();
        /*este metodo hash vai pegar a senha do usuario e concatenar aleatoriamente com o salt.*/
        this.body.password = bcryptjs.hashSync(this.body.password, salt); 
        //o modelo do MongoDB é aplicado à chave user do objeto construtor
        this.user = await LoginModel.create(this.body);        
}


    //procurando se tem um e-mail igual na base de dados
    async userExists() {
        this.user = await LoginModel.findOne({ email: this.body.email });
        if(this.user) this.errors.push('Usuário já existe.');
    }

    valida() {
        this.cleanUp();
        //Validacao
        //O e-mail precisa ser valido
        //aplicando o validator para checar o email
        //A senha precisa ter entre 3 e 50 caracteres
        if(!validator.isEmail(this.body.email)) this.errors.push('E-mail inválido');
        if(this.body.password.length < 3 || this.body.password.length > 50) {
        this.errors.push('A senha precisa ter entre 3 e 50 caracteres.');
          }
        }
    //esta função vai limpar o objeto
    cleanUp() {
        //loop nas chaves do objeto body (campos do formulário)
        for (const key in this.body) { 
            //se nao for uma string o campo ficará vazio
            if (typeof this.body[key] !== 'string') {
                this.body[key] = ''; 
            }
        }
        /*aqui estamos garantindo apenas os dados que queremos do form. Automaticamente, o body envia o csrf token junto com email e senha, mas como o dado é sigiloso, criamos o objeto abaixo para que ele não ir para a base de dados. este é o desdobramento do body da função construtora lá de cima*/
        this.body = {
            email: this.body.email,
            password: this.body.password
        };
    }
}

module.exports = Login;
