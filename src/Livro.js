import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import BotaoSubmitCustomizado from './componentes/BotaoSubmitCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';

class FormularioLivro extends Component {

    constructor() {
        super();
        this.state = {lista: [], titulo: '', preco: '', autorId: ''};
        this.enviaForm = this.enviaForm.bind(this);
    }

    enviaForm(evento) {
        evento.preventDefault();
        
        $.ajax({
            url: 'http://localhost:8080/api/livros',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({titulo: this.state.titulo, preco: this.state.preco, autorId: this.state.autorId}),
            success: function(novaListagem) {
                // disparar um aviso geral de nova listagem disponivel
                PubSub.publish('atualiza-lista-livros', novaListagem);
                this.setState({titulo: '', preco: '', autorId: ''});
            }.bind(this),
            error: function(resposta) {
                if(resposta.status === 400) {
                    new TratadorErros().publicaErros(resposta.responseJSON);
                }
            },
            beforeSend: function() {
                PubSub.publish('limpa-erros', {});
            }
        })
    }

    salvaAlteracao(nomeInput, evento) {
        var campoSendoAlterado = {};
        campoSendoAlterado[nomeInput] = evento.target.value;
        this.setState(campoSendoAlterado);
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" method="post" onSubmit={this.enviaForm}>

                    <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.salvaAlteracao.bind(this, 'titulo')} label="Titulo"/>
                    <InputCustomizado id="preco" type="text" name="preco" value={this.state.preco} onChange={this.salvaAlteracao.bind(this, 'preco')} label="Preço"/>
                    <div className="pure-control-group">
                        <label htmlFor="autorId">Autor</label>
                        <select value={this.state.autorId} name="autorId" id="autorId" onChange={this.salvaAlteracao.bind(this, 'autorId')}>
                            <option value="">Selecione autor</option>
                            {
                                this.props.autores.map(function(autor) {
                                    return <option value={autor.id}>{autor.nome}</option>
                                })
                            }
                        </select>
                    </div>

                    <BotaoSubmitCustomizado label="Gravar" />
                    
                    </form>
            </div>
        )
    }
}

class TabelaLivros extends Component {

    render() {
        return (
            <div>
                        <table className="pure-table">
                            <thead>
                                <tr>
                                    <th>Titulo</th>
                                    <th>Preco</th>
                                    <th>Autor</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    this.props.lista.map(livro => {
                                        return (
                                            <tr key={livro.id}>
                                                <td>{livro.titulo}</td>
                                                <td>{livro.preco}</td>
                                                <td>{livro.autor.nome}</td>
                                            </tr>
                                        )
                                    })
                                }

                            </tbody>

                        </table>
                    </div>
        );
    }
}

export default class LivroBox extends Component {

    constructor() {
        super();
        this.state = {lista: [], autores: []};
    }

    componentDidMount() {
        
        $.ajax({
            url: "http://localhost:8080/api/livros",
            dataType: 'json',
            success: function(resposta) {
                // console.log(resposta);
                // console.log(this);
        
                this.setState({lista: resposta});
            }.bind(this)
        });
        $.ajax({
            url: "http://localhost:8080/api/autores",
            dataType: 'json',
            success: function(resposta) {
                // console.log(resposta);
                // console.log(this);
        
                this.setState({autores: resposta});
            }.bind(this)
        });

        PubSub.subscribe('atualiza-lista-livros', function(topico, novaLista) {
            //console.log(topico);
            this.setState({lista: novaLista});
        }.bind(this));
    }

    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de Livros</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivro autores={this.state.autores} />
                    <TabelaLivros lista={this.state.lista} />
                </div>
            </div>
        )
    }
}