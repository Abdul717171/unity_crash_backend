// eslint-disable-next-line import/no-extraneous-dependencies
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import tokenTypes from './tokens.js';
import User from '../../models/user.js';

const jwtOptions = {
  secretOrKey: 'thisisasamplesecret',
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    // console.log('payload', { payload });
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    // console.log('eror', error);
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

export default jwtStrategy;
