import logger from '#config/logger.js';
import { createUser, authenticateUser } from '#services/auth.service.js';
import { cookies } from '#utils/cookies.js';
import { formatValidationError } from '#utils/format.js';
import { jwttoken } from '#utils/jwt.js';
import { signUpSchema, signInSchema } from '#validations/auth.validation.js';

export const signup=async(req,res,next)=>{
  try {
    const validationResult=signUpSchema.safeParse(req.body);
    if (!validationResult.success){
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error)

      }

      );

    }
    const {name,email,password,role}=validationResult.data;

    // Auth Service call
    const user=await createUser({name,email,password,role});
    const token=jwttoken.sign({id:user.id,email:user.email,role:user.role});
    cookies.set(res,'token',token);

    logger.info(`User registred successfully : ${email}`);
    res.status(201).json({
      message: 'User registered',
      user:{
        id:user.id,
        name:user.name,
        email:user.email,
        role:user.role
      }

    });

  } catch (e) 
  {
    logger.error('sign up error',e);
    if(e.message==='User with his email already exists'){
      return res.status(409).json({error:'Email alreday exists'});

    }
    next(e);
        
  }

};

export const signin=async(req,res,next)=>{
  try {
    const validationResult=signInSchema.safeParse(req.body);
    if (!validationResult.success){
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error)
      });
    }
    const {email,password}=validationResult.data;

    // Auth Service call
    const user=await authenticateUser({email,password});
    const token=jwttoken.sign({id:user.id,email:user.email,role:user.role});
    cookies.set(res,'token',token);

    logger.info(`User signed in successfully : ${email}`);
    res.status(200).json({
      message: 'User signed in',
      user:{
        id:user.id,
        name:user.name,
        email:user.email,
        role:user.role
      }
    });

  } catch (e) 
  {
    logger.error('sign in error',e);
    if(e.message==='User not found'){
      return res.status(404).json({error:'User not found'});
    }
    if(e.message==='Invalid password'){
      return res.status(401).json({error:'Invalid password'});
    }
    next(e);
  }
};

export const signout=async(req,res,next)=>{
  try {
    cookies.clear(res,'token');
    logger.info('User signed out successfully');
    res.status(200).json({
      message: 'User signed out'
    });
  } catch (e) 
  {
    logger.error('sign out error',e);
    next(e);
  }
};
