const express = require('express');

const shortId=require('shortid')

const createHttpError = require('http-errors')

const mongoose = require('mongoose')
const path = require('path')
const ShortUrl=require('./models/url.model');
//const {Server} = require('http');
//const { Router } = require('express');

const app= express()

app.use(express.static(path.join(__dirname,'public')))    
app.use(express.json())
app.use(express.urlencoded({ extended: false}))

mongoose
 .connect("mongodb://localhost:27017",{
    dbName: 'url-shortner',
    useNewUrlParser: true,
    useUnifiedTopology: true,
   // useCreateIndex: true,
})
.then(() => console.log("mongoose connected ") )
.catch((error) => console.log("error connecting..."));
app.set('view engine','ejs')
//app.set('views engine', path.join(__dirname, '/app_server/views'));
app.get('/', async ( req, res, next ) => {
res.render('engine')    
})

app.post('/',async (req, res,next)=>{
    try{
        const{url}=req.body
        if(!url){
            throw createHttpError.BadRequest('provide a valid url...')

        }
        const urlExists = await ShortUrl.findOne({url}) 
        if (urlExists){
            res.render('engine', {
                short_url: 'http://localhost:8080/'+urlExists.shortId, 
            })
       return 
        }
        const shortUrl=new ShortUrl({url:url,shortId:shortId.generate() })
        const result=await shortUrl.save()
        res.render('engine',{
            short_url: 'http://localhost:8080/'+result.shortId })
    }
    catch(error){
        next(error)

    }

})
app.get('/:shortId',async(req,res,next) =>{
    try{
 const {shortId}=req.params   
const result=await ShortUrl.findOne({shortId:shortId})
if(!result){
 throw createHttpError.NotFound('short url does not exist')
}
res.redirect(result.url)
    }catch(error){
next(error)
    }

})
 app.use((req,res,next) =>{
next(createHttpError.NotFound())
 })


 app.use((err,req,res,next) =>{
res.status(err.status || 500)
res.render('engine',{error: err.message})
 })
//const PORT=8080;
app.listen(8080,() =>console.log('server running on port 8080...')//it will run at port no:8080
)

//module.exports=Router;

 