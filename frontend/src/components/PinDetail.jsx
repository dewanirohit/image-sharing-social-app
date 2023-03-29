import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MdDownloadForOffline } from "react-icons/md";
import { v4 as uuidV4 } from "uuid";

import { client, urlFor } from "../utils/client";
import { pinDetailMorePinQuery, pinDetailQuery } from "../utils/data";

import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";

const PinDetail = ({ user }) => {
	const { pinId } = useParams();
	const [pins, setPins] = useState();
	const [pinDetail, setPinDetail] = useState();
	const [comment, setComment] = useState("");
	const [addingComment, setAddingComment] = useState(false);

	const fetchPinDetails = () => {
		const query = pinDetailQuery(pinId);

		if (query) {
			client
				.fetch(`${query}`)
				.then((data) => {
					setPinDetail(data[0]);

					if (data[0]) {
						const query1 = pinDetailMorePinQuery(data[0]);

						client
							.fetch(query1)
							.then((res) => {
								setPins(res);
							})
							.catch((error) => console.log(error));
					}
				})
				.catch((error) => console.log(error));
		}
	};

	useEffect(() => {
		fetchPinDetails();
	}, [pinDetail]);

	const addComment = () => {
		if (comment) {
			setAddingComment(true);

			client
				.patch(pinId)
				.setIfMissing({ comments: [] })
				.insert("after", "comments[-1]", [
					{
						comment,
						_key: uuidV4(),
						postedBy: { _type: "postedBy", _ref: user._id },
					},
				])
				.commit()
				.then(() => {
					fetchPinDetails();
					setComment("");
					setAddingComment(false);
				});
		}
	};

	if (!pinDetail) {
		return <Spinner message="Showing pin" />;
	}

	return (
		<>
			{pinDetail && (
				<div
					className="flex xl:flex-row flex-col m-auto bg-white"
					style={{ maxWidth: "1500px", borderRadius: "32px" }}
				>
					<div className="flex justify-center items-center md:items-start flex-initial">
						<img
							src={
								pinDetail?.image &&
								urlFor(pinDetail?.image).url()
							}
							alt="user-post"
							className="rounded-t-3xl rounded-b-lg"
						/>
					</div>

					<div className="w-full p-5 flex-1 xl:min-w-620">
						<div className="flex items-center justify-between">
							<div className="flex gap-2 items-center">
								<Link
									to={`${pinDetail.image.asset.url}?dl=`}
									download
									className="bg-secondaryColor p-2 text-xl rounded-full flex items-center justify-center text-dark opacity-75 hover:opacity-100"
								>
									<MdDownloadForOffline />
								</Link>
							</div>

							<Link
								to={pinDetail.destination}
								target="_blank"
								rel="noreferrer"
							>
								{pinDetail.destination?.slice(8)}
							</Link>
						</div>

						<div>
							<h1 className="text-4xl font-bold break-words mt-3">
								{pinDetail.title}
							</h1>

							<p className="mt-3">{pinDetail.about}</p>
						</div>

						<Link
							to={`/user-profile/${pinDetail?.postedBy._id}`}
							className="flex gap-2 mt-5 items-center bg-white rounded-lg "
						>
							<img
								src={pinDetail?.postedBy.image}
								alt="profile pic"
								className="w-10 h-10 rounded-full"
							/>

							<p className="font-bold">
								{pinDetail?.postedBy.userName}
							</p>
						</Link>

						<h2 className="mt-5 text-2xl">Comments</h2>

						<div className="max-h-370 overflow-y-auto">
							{pinDetail?.comments?.map((item, index) => (
								<div
									key={index}
									className="flex gap-2 mt-5 items-center bg-white rounded-lg"
								>
									<img
										src={item.postedBy?.image}
										alt="user profile"
										className="w-10 h-10 rounded-full cursor-pointer"
									/>

									<div className="flex flex-col">
										<p className="font-bold">
											{item.postedBy?.userName}
										</p>

										<p>{item.comment}</p>
									</div>
								</div>
							))}
						</div>

						<div className="flex flex-wrap mt-6 gap-3">
							<Link to={`/user-profile/${user._id}`}>
								<img
									src={user.image}
									alt="user-profile"
									className="w-10 h-10 rounded-full cursor-pointer"
								/>
							</Link>

							<input
								type="text"
								placeholder="Add a comment"
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								className=" flex-1 border-gray-100 outline-none border-2 p-2 rounded-2xl focus:border-gray-300"
							/>

							<button
								type="button"
								className="bg-red-500 text-white rounded-full px-6 py-2 font-semibold text-base outline-none"
								onClick={addComment}
								disabled={addingComment}
							>
								{addingComment ? "Submitting..." : "Submit"}
							</button>
						</div>
					</div>
				</div>
			)}

			{pins?.length > 0 && <h2>More like this</h2>}

			{pins ? (
				<MasonryLayout pins={pins} />
			) : (
				<Spinner message="Loading more pins" />
			)}
		</>
	);
};

export default PinDetail;
