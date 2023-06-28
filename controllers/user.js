import users from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import posts from "../models/post.js";
export const register = async (req,res) => {
    try
    {
        const {name,email,password,image} = req.body;
        let userinfo = await users.findOne({email});
        if(userinfo)
        {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }
        const hashPass = await bcrypt.hash(password,10);
        userinfo = await users.create({
            name,
            email,
            password: hashPass,
            avatar: {
                public_id: "sample_id",
                url: image
            },
        });
        res.status(201).json({
            success: true,
            message: "Registered Successfully"
        })
    }
    catch (error)
    {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
export const login = async (req,res) => {
    try
    {
        const {email,password} = req.body;
        let userinfo = await users.findOne({email}).select("+password");
        if(!userinfo)
        {
            return res.status(404).json({
                success: false,
                message: "Register first"
            });
        }
        const isMatch = await bcrypt.compare(password,userinfo.password);
        if(!isMatch)
        {
            return res.status(404).json({
                success: false,
                message: "Wrong Password"
            });
        }
        const token = await jwt.sign({_id:userinfo._id},process.env.JWT_SECRET);
        res.status(200)
        .cookie("token",token)
        .json({
            success: true,
            message: `Welcome back ${userinfo.name}`
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
export const followUser = async (req,res) => {
    try
    {
        const {id} = req.params;
        const userToFollow = await users.findById(id);
        const userinfo = await users.findById(req.user._id);
        if(!userToFollow)
        {
            return res.status(404).json({
                success: false,
                message: "User to follow not found"
            })
        }
        if(userinfo.following.includes(id))
        {
            const index = userinfo.following.indexOf(id);
            userinfo.following.splice(index,1);
            const findex = userToFollow.followers.indexOf(userinfo._id);
            userToFollow.followers.splice(findex,1);
            await userinfo.save();
            await userToFollow.save();
            return res.status(200).json({
                success: true,
                message: `Unfollowed ${userToFollow.name}`
            })
        }
        userinfo.following.push(userToFollow._id);
        userToFollow.followers.push(userinfo._id);
        await userinfo.save();
        await userToFollow.save();
        return res.status(200).json({
            success: true,
            message: `You started following ${userToFollow.name}`
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
export const logout = async (req,res) => {
    try
    {
        res.status(200).cookie("token","",{
            expires: new Date(Date.now()),
            httpOnly: true
        }).json({
            success: true,
            message: "Logged Out"
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
export const updatePassword = async (req,res) => {
    try 
    {
        const userinfo = await users.findById(req.user._id).select("+password");
        const {oldPassword,newPassword} = req.body;
        if(!oldPassword || !newPassword)
        {
            return res.status(400).json({
                success: false,
                message: "Enter both new and old password"
            })
        }
        const isMatch = await bcrypt.compare(oldPassword,userinfo.password);
        if(!isMatch)
        {
            return res.status(400).json({
                success: false,
                message: "Incorrect old password"
            })
        }
        const hashPass = await bcrypt.hash(newPassword,10);
        userinfo.password = hashPass;
        await userinfo.save();
        res.status(200).json({
            success: true,
            message: "Updated Password"
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
export const updateProfile = async (req,res) => {
    try 
    {
        const userinfo = await users.findById(req.user._id);
        const {name,email} = req.body;
        let update = "Nothing";
        if(name)
        {
            userinfo.name = name;
            update = "Name";
        }
        if(email)
        {
            userinfo.email = email; 
            if(update === "Name")
            {
                update = "both name and email";
            }
            else
            {
                update = "Email";
            }

        }
        await userinfo.save();
        res.status(200).json({
            success: true,
            message: `Updated ${update}`,
            user: userinfo
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
export const deleteProfile = async (req,res) => {
    try
    {
        const userinfo = await users.findById(req.user._id);
        const userPost = userinfo.posts;
        const userFollowers = userinfo.followers;
        const userFollowing = userinfo.following;
        const allPosts = await posts.find({});

        await userinfo.deleteOne();
        res.cookie("token","",{
            expires: new Date(Date.now()),
            httpOnly: true
        })
        for(let i = 0;i < userPost.length;i++)
        {
            const postinfo = await posts.findById(userPost[i]);
            await postinfo.deleteOne();
        }
        for(let i = 0;i < allPosts.length;i++)
        {
            const index = allPosts[i].likes.indexOf(req.user._id);
            allPosts[i].likes.splice(index,1);
            await allPosts[i].save();
            const final = allPosts[i].comments.filter((item) => {
                return item.user !== req.user._id
            })
            allPosts[i].comments = final;
            await allPosts[i].save();
        }
        for(let i = 0;i < userFollowers.length;i++)
        {
            const info = await users.findById(userFollowers[i]);
            const index = info.following.indexOf(req.user._id);
            info.following.splice(index,1);
            await info.save();
        }
        for(let i = 0;i < userFollowing;i++)
        {
            const info = await users.findById(userFollowing[i]);
            const index = info.followers.indexOf(req.user._id);
            info.followers.splice(index,1);
            await info.save();
        }
        res.status(200).json({
            success: true,
            message: "Profile Deleted"
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
export const myProfile = async (req,res) => {
    try
    {
        const userPosts = await users.findById(req.user._id).populate("followers").populate("following");
        res.status(200).json({
            success: true,
            myProfile: userPosts
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
export const getUserProfile = async (req,res) => {
    try
    {
        const {id} = req.params;
        const userinfo = await users.findById(id).populate("posts");
        if(!userinfo)
        {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            Posts: userinfo
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
export const getAllUsers = async (req,res) => {
    try
    {
        const userinfos = await users.find({name: {$regex: req.query.name,$options: "i"}});
        res.status(200).json({
            success: true,
            Users: userinfos
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
export const forgotPassword = async (req,res) => {
    try
    {
        const {email} = req.body;
        const userinfo = await users.findOne({email});
        if(!userinfo)
        {
            return res.status(404).json({
                success: true,
                message: "Enter Valid Email"
            })
        }
        
    } 
    catch (error)
    {
        res.status(500).json({
            success: false,
            message: error.message  
        })
    }
}
export const getAllFollowing = async (req,res) => {
    try
    {
        const userinfo = await users.findById(req.user._id).populate("following");
        return res.status(200).json({
            success: true,
            Following: userinfo.following
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