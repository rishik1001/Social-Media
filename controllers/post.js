import posts from "../models/post.js";
import users from "../models/user.js";
export const getAllPosts = () => {
    const postsinfo = posts.findOne({ owner: req.user._id });
    res.status(200).json({
        posts: postsinfo
    })
}
export const createPost = async (req, res) => {
    try {
        const newPost = await posts.create({
            caption: req.body.caption,
            imageUrl: {
                public_id: "req.body.public_id",
                url: req.body.image
            },
            owner: req.user._id
        });
        const userinfo = await users.findById(req.user._id);
        userinfo.posts.push(newPost._id);
        await userinfo.save();
        res.status(201).json({
            success: true,
            message: "Post Added",
            post: newPost
        });

    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}
export const likeAndUnlikePost = async (req, res) => {
    try {
        const { id } = req.params;
        const postinfo = await posts.findById(id).populate("likes");
        if (!postinfo) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }
        const likedIndex = postinfo.likes.findIndex((item) => item._id.toString() === req.user._id.toString());
        if (likedIndex !== -1) {
            postinfo.likes.splice(likedIndex, 1);
            await postinfo.save();
            return res.status(200).json({
                success: true,
                message: "Post Unliked",
                posts: postinfo
            });
        }
        else {
            postinfo.likes.push(req.user);
            await postinfo.save();
            return res.status(200).json({
                success: true,
                message: "Post Liked",
                posts: postinfo
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const postinfo = await posts.findById(id);
        if (!postinfo) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }
        if (postinfo.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
        await postinfo.deleteOne();
        const userinfo = await users.findById(req.user._id);
        const index = await userinfo.posts.indexOf(id);
        userinfo.posts.splice(index, 1);
        await userinfo.save();
        res.status(200).json({
            success: true,
            message: "Post Deleted"
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
export const getpostsOfFollowing = async (req, res) => {
    try {
        const userinfo = await users.findById(req.user._id);
        const postsinfo = await posts.find({
            owner: {
                $in: userinfo.following
            }
        }).populate("owner").populate("likes").populate("comments.user");
        res.status(200).json({
            success: true,
            posts: postsinfo.reverse()
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
export const updateCaption = async (req, res) => {
    try {
        const { newCaption } = req.body;
        const { id } = req.params;
        if (!newCaption) {
            return res.status(400).json({
                success: true,
                message: "Enter caption"
            })
        }
        const postinfo = await posts.findById(id);
        if (!postinfo) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }
        if (req.user._id.toString() !== postinfo.owner.toString()) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
        postinfo.caption = newCaption;
        await postinfo.save();
        res.status(200).json({
            success: true,
            caption: "Caption Updated"
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const postinfo = await posts.findById(id);
        if (!postinfo) {
            return res.status(404).json({
                success: true,
                message: "Post not found"
            });
        }
        const { comment } = req.body;
        if (comment === '') {
            return res.status(400).json({
                success: true,
                message: "Add comment"
            })
        }
        const userinfo = await users.findById(req.user._id);
        postinfo.comments.push({ user: userinfo._id, comment });
        await postinfo.save();
        let len = postinfo.comments.length
        const commentid = postinfo.comments[len - 1]._id;
        res.status(200).json({
            success: true,
            message: "Comment Added",
            commentid
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const postinfo = await posts.findById(id);
        if (!postinfo) {
            res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }
        // console.log(postinfo);
        if (!req.body.commentId) {  
            return res.status(400).json({
                success: false,
                message: "Comment Id is required"
            })
        }
        postinfo.comments.forEach((items, index) => {
            if (items._id.toString() === req.body.commentId.toString()) {
                return postinfo.comments.splice(index, 1);
            }
        })
        await postinfo.save();
        res.status(200).json({
            success: true,
            message: "Comment has been Deleted"
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
export const getAllLikesOfPost = async (req, res) => {
    try {
        const { id } = req.params;
        const postinfo = await posts.findById(id).populate("likes");
        let allLikes = [];
        postinfo.likes.forEach((item) => {
            allLikes.push(item.name);
        })
        res.status(200).json({
            success: true,
            Likes: allLikes
        })

    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
export const getMyPosts = async (req,res) => {
    try
    {
        const postinfo = await posts.find({owner: req.user._id}).populate("owner").populate("likes").populate("comments.user");
        res.status(200).json({
            success: true,
            posts: postinfo.reverse()
        })
        
    }
    catch (error)
    {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}