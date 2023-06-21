
import catchAsync from '../utils/catchAsync.js';
import Game_loop from '../models/game_loop.js';

export const getMultiplierHistory = catchAsync(async (req, res) => {
    // const { gameId } = req.params;
    // const game = await gameService.getGameById(gameId);
    const allHistory = await Game_loop.find().populate("User").sort({_id: -1 }).limit(11);
    console.log('allHistory--->',allHistory);
    res.send({ allHistory });
  });