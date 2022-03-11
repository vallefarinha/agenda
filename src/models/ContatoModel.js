const mongoose = require('mongoose');
const validator = require('validator');

const ContatoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  sobrenome: { type: String, required: false, default: '' },
  email: { type: String, required: false, default: '' },
  telefone: { type: String, required: false, default: '' },
  criadoEm: { type: Date, default: Date.now },
});

const ContatoModel = mongoose.model('Contato', ContatoSchema);

function Contato(body) {
  this.body = body;
  this.errors = [];
  this.contato = null;
}

//como trabalha com banco de dados, a função deve ser assincrona
Contato.prototype.register = async function () {
    this.valida();
    if (this.errors.length > 0) return;
    //mandando o objeto pronto para a chave contato criada no objeto acima
    this.contato = await ContatoModel.create(this.body);
};

Contato.prototype.valida = function () {
    this.cleanUp();
    //Validacao
    //se o usuario preencher o email, valida e passa pra proxima
    if(this.body.email && !validator.isEmail(this.body.email)) this.errors.push('E-mail inválido');
    if(!this.body.nome) this.errors.push('Nome é um campo obrigatório.');
    if(!this.body.email && !this.body.telefone) {
      this.errors.push('Pelo menos um contato precisa ser enviado: e-mail ou telefone.');
    }
  };
//esta função vai limpar o objeto
Contato.prototype.cleanUp = function() {
    //loop nas chaves do objeto body (campos do formulário)
    for (const key in this.body) { 
        //se nao for uma string o campo ficará vazio
        if (typeof this.body[key] !== 'string') {
            this.body[key] = ''; 
        }
    }
    /*aqui estamos garantindo apenas os dados que queremos do form. Automaticamente, o body envia o csrf token junto com email e senha, mas como o dado é sigiloso, criamos o objeto abaixo para que ele não ir para a base de dados. este é o desdobramento do body da função construtora lá de cima*/
    this.body = {
        nome: this.body.nome,
        sobrenome: this.body.sobrenome,
        email: this.body.email,
        telefone: this.body.telefone,
      };
};
    
Contato.prototype.edit = async function (id) {
    if (typeof id !== 'string') return;
    this.valida();
    if (this.errors.length > 0) return;
    //encontra o contato por ID e atualiza seus dados. quando atualizar o contato, devolve os dados novos(new:true). salva tudo isso na chave contato
    this.contato = await ContatoModel.findByIdAndUpdate(id, this.body, { new: true });
};

//Método estático, não está atrelada ao prototype. nao precisa instanciar
Contato.buscaPorId = async function(id) {
    if(typeof id !== 'string') return;
    const contato = await ContatoModel.findById(id);
    return contato;
  };

Contato.buscaContatos = async function () {
    //se quisesse filtar por e-mail, telfone, teria que colocar mais parametros
    const contatos = await ContatoModel.find()
    //ordenando por ordem decrescente de criação dos contatos
    .sort({ criadoEm: -1 });
    return contatos;
};

Contato.delete = async function (id) {
    if (typeof id !== 'string') return;
    //O _id: id é um objeto com filtro e vai pegar o id do contato selecionado. se fosse só id ia deletar o primeiro
    const contato = await ContatoModel.findOneAndDelete({_id: id});
    return contato;
};
   

module.exports = Contato;
