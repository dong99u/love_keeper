const express = require("express");
const session = require("express-session"); // express-session 미들웨어를 가져와 사용자 세션을 관리합니다.
const MongoStore = require("connect-mongo"); // MongoDB에 세션 데이터를 저장하기 위해 connect-mongo를 가져옵니다.
const morgan = require("morgan"); //  Express용 로깅 미들웨어인 morgan 가져오기.

// Routers
const letterRouter = require("./routers/letterRouter.js");
const loginRouter = require("./routers/loginRouter.js");
const profileRouter = require("./routers/profileRouter.js");
const bannedWordRouter = require("./routers/bannedWordRouter.js");
const diaryRouter = require("./routers/diaryRouter.js");

const app = express();

app.use(morgan("dev"));
app.set("view engine", "pug");
app.set("views", "src/views");

app.use(express.json()); // 클라이언트가 본문에 JSON 데이터가 포함된 HTTP POST 또는 PUT 요청을 보낼 때(예: axios, fetch 또는 기타 도구를 통해) 이 미들웨어는 JSON 데이터 읽기, 구문 분석 및 결과 첨부를 처리합니다. JavaScript 개체를 request.body 속성에 추가합니다.
app.use(express.urlencoded({ extended: true })); // 요청 본문에서 들어오는 URL 인코딩 데이터를 구문 분석합니다.
app.use("/img/uploads", express.static(`${__dirname}/uploads`)); // uploads 폴더를 정적 경로로 추가

// 세션 미들웨어 설정: express-session 미들웨어를 사용하려면 먼저 앱에 세션 미들웨어를 추가해야 합니다.
app.use(
	// session middleware 를추가. router 앞에 설정해야함!
	session({
		secret: process.env.COOKIE_SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24,
		}, // 24 hours 쿠키 유지시간
		store: MongoStore.create({
			mongoUrl: process.env.DB_URL,
		}),
	})
);

app.use("/", loginRouter);
app.use("/letters", letterRouter);
app.use("/profile", profileRouter);
app.use("/diary", diaryRouter);
app.use("/bannedWord", bannedWordRouter);

module.exports = app;
