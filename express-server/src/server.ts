import { App } from '@/app';
import { UserRoute } from '@routes/users.route';
import { RoomRoute } from '@routes/rooms.route';
import { ValidateEnv } from '@utils/validateEnv';

ValidateEnv();

const app = new App([new UserRoute(), new RoomRoute()]);

app.listen();
