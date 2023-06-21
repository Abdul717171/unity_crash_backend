// eslint-disable-next-line import/no-extraneous-dependencies
import morgan from 'morgan';
import logger from './logger.js';

morgan.token('message', (req, res) => res.locals.errorMessage || '');

const getIpFormat = () =>
  (process.env.ENVIROMENT === 'production' ? ':remote-addr - ' : '');
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

export const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: (message) => logger.info(message.trim()) },
});

export const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: (message) => logger.error(message.trim()) },
});