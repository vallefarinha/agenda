const Login = require('../models/LoginModel');

//RENDERIZANDO PAGINA INICIAL
exports.index = (req, res) => {
    //o parenteses é a forma de checar se o usuario está logado. Depois renderiza a pagina do login-logado
  if (req.session.user) return res.render('login-logado');
  //renderizando a pagina de login
    return res.render('login');
};
  
//RENDERIZANDO PAGINA DE LOGIN
//O QUE FOR POSTADO AQUI VAI SER RECEBIDO NA CLASSE LOGIN DO LOGIN MODEL
//como está usando dados de uma promise(do loginModel), esta função também deve ser async
exports.register = async function (req, res) {
  try {
      //instancia da classe Login do loginModel, pega os dados do formulario
      const login = new Login(req.body);
      //pega o retorno da promise da loginModel
      await login.register();

      if(login.errors.length > 0) {
          //flash são nossas mensagens
          req.flash('errors', login.errors);
          /* Session é basicamente uma forma que usamos para salvar dados referentes a um usuário no servidor. salvar a sessão do erro para retornar para a página de login. é boa prática sempre salvar a session. estamos salvando a session no mongodb*/
          req.session.save(function() {
              return res.redirect('back');
            });
            return;
          }

          req.flash('success', 'Seu usuário foi criado com sucesso.');
          req.session.save(function() {
            return res.redirect('back');
          });
        } catch(e) {
          console.log(e);
          return res.render('404');
        }
      };

exports.login = async function (req, res) {
    try {
        //instancia da classe, pega os dados do formulario
        const login = new Login(req.body);
        //pega o retorno da promise da loginModel
        await login.login();

        if(login.errors.length > 0) {
        //flash são nossas mensagens
        req.flash('errors', login.errors);
        /* Session é basicamente uma forma que usamos para salvar dados referentes a um usuário no servidor. salvar a sessão do erro para retornar para a página de login. é boa prática sempre salvar a session. estamos salvando a session no mongodb*/
        req.session.save(function() {
        return res.redirect('back');
        });
        return;
        }

        req.flash('success', 'Você entrou no sistema');
        //jogando o usuário para dentro da sessao 
        req.session.user = login.user;
        req.session.save(function() {
            return res.redirect('back');
        });
        } catch(e) {
        console.log(e);
        return res.render('404');
        }
    };


exports.logout = function (req, res) {
  req.session.destroy();
  res.redirect('/');
};

