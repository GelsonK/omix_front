const Sequelize = require('sequelize')
const { FORCE } = require('sequelize/lib/index-hints')
require('dotenv').config()
const caneca = new Sequelize(
    process.env.DB_database,
    process.env.DB_user,
    process.env.DB_password,
    {
        host: process.env.DB_host,
        dialect: process.env.DB_dialect,
        logging: false,
    }
);

const users = caneca.define('users', {

    nome: {
        type: Sequelize.STRING
    },
    data: {
        type: Sequelize.STRING
    },
    genero: {
        type: Sequelize.STRING
    },
    telefone: {
        type: Sequelize.STRING
    },
    sala: {
        type: Sequelize.STRING
    },
    periodo: {
        type: Sequelize.STRING
    },
    text: {
        type: Sequelize.STRING
    },
    imagem: {
        type: Sequelize.STRING
    },
    omix:{
        type:Sequelize.STRING
    },
    status: { 
    type: Sequelize.ENUM('pendente','aprovado','reprovado'), 
    defaultValue: 'pendente' 
}
})
users.sync({FORCE:true})

//module.exports=users