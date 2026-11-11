import express from 'express';
import {
  getIceCreams,
  getIceCreamById,
  createIceCream,
  updateIceCream,
  deleteIceCream,
} from '../controllers/iceCreamController.js';

const router = express.Router();

router.route('/')
  .get(getIceCreams)
  .post(createIceCream);

router.route('/:id')
  .get(getIceCreamById)
  .put(updateIceCream)
  .delete(deleteIceCream);

export default router;

