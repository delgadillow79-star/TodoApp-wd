const { request, response } = require("../app");
const usersRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { PAGE_URL } = require("../config");

usersRouter.post("/", async (request, response) => { 
  const { name, email, password } = request.body;

  if (!name || !email || !password) {
    return response.status(400).json({ error: "Todos los espacios son requeridos" });
  };
  
  const userExist = await User.findOne({ email });

  if (userExist) {
        return response.status(400).json({ error: "El email ya se encuentra en uso" });
  };

  const saltRounds = 10;

  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser = new User({
    name,
    email,
    passwordHash,
  });

  const savedUser = await newUser.save();
  const token = jwt.sign({ id: savedUser.id}, process.env.ACCESS_TOKEN_SECRET, { 
   expiresIn: '1d'
});


 const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

(async () => {
   await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: savedUser.email,
    subject: "Verificación de usuario",
    html: `<a href="${PAGE_URL}/verify/${token}">Verificar correo</a>`,
  });

  console.log("Message sent:", info.messageId);
})();

return response.status(201).json("Usuario creado. Por favor, verifica tu  correo." );

});

usersRouter.patch('/:token', async (request, response) => { 
try {
  const token = request.params.token;
  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  console.log(decodedToken);
} catch (error) {
  console.log(error);
  return response.status(400).json({error: 'El link ya expiró'});
}
  
});


module.exports = usersRouter ;
