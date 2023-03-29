import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase-config";

import { client } from "../utils/client";

import video from "/video.mp4";
import logo from "/logo.png";

const Login = () => {
	const navigate = useNavigate();

	const handleLogin = () => {
		signInWithPopup(auth, provider)
			.then((result) => {
				const user = result.user;

				localStorage.setItem("user", JSON.stringify(user));
				const { displayName, uid, photoURL } = user;

				const doc = {
					_id: uid,
					_type: "user",
					userName: displayName,
					image: photoURL,
				};

				client
					.createIfNotExists(doc)
					.then(() => {
						navigate("/", { replace: true });
					})
					.catch((error) => console.log(error));
			})
			.catch((error) => console.log(error));
	};

	return (
		<div className="flex justify-start items-center flex-col h-screen">
			<div className="relative w-full h-full">
				<video
					src={video}
					type="video/mp4"
					loop
					controls={false}
					muted
					autoPlay
					className="w-full h-full object-cover"
				/>

				<div className="absolute flex flex-col justify-center items-center inset-0 | bg-blackOverlay">
					<div className="p-5">
						<img
							src={logo}
							alt="logo"
							width={130}
						/>
					</div>

					<div className="shadow-2xl">
						<button
							type="button"
							className="bg-mainColor flex justify-center items-center p-3 rounded-lg cursor-pointer outline-none"
							onClick={handleLogin}
						>
							<FcGoogle className="mr-4" />
							Sign in with google
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
