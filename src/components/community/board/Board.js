import React, { useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import "./Board.css";

const Board = ({ posts, setPosts, addComment, updateComment, deleteComment, addPost, updatePost, deletePost, searchPosts,  }) => {
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [editPost, setEditPost] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewPost({ ...newPost, [name]: value });
  };

  // Board.js 파일 내부에 추가


  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!localStorage.getItem('token')) {
      alert("로그인 후에 글 작성이 가능합니다.");
      return;
    }

    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
    const newPostWithDate = { ...newPost, date: formattedDate };

    if (editPost) {
      try {
        await axiosInstance.put(`http://127.0.0.1:8080/board/${editPost.id}`, {
          author: newPostWithDate.author,
          title: newPostWithDate.title,
          content: newPostWithDate.content,
          date: newPostWithDate.date,
        });

        const updatedPosts = posts.map((post) =>
          post.id === editPost.id ? { ...editPost, ...newPostWithDate } : post
        );
        setPosts(updatedPosts);
        setEditPost(null);
      } catch (error) {
        console.error("Error updating post:", error);
      }
    } else {
      try {
        
        const response = await axiosInstance.post("http://127.0.0.1:8080/board", {
          author: newPostWithDate.author,
          title: newPostWithDate.title,
          content: newPostWithDate.content,
        });

        if (response.data) {
          setPosts([...posts, response.data]);
        }
      } catch (error) {
        console.error("Error adding post:", error);
      }
    }

    setNewPost({ title: "", content: "" });
    setShowForm(false);
  };

  const handleEdit = (post) => {
    setEditPost(post);
    setNewPost(post);
    setShowForm(true);
  };

  const handleDelete = async (postId) => {
    try {
      await axiosInstance.delete(`http://127.0.0.1:8080/board/${postId}`);
      const updatedPosts = posts.filter((post) => post.id !== postId);
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const togglePostContent = (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
    }
  };

  const handleAddComment = (postId) => {
    if (commentText.trim() !== "") {
      addComment(postId, commentText);
      setCommentText("");
    }
  };

  const handleEditComment = (postId, commentId, commentContent) => {
    setEditingCommentId(commentId);
    setEditingCommentText(commentContent);
  };

  // const handleCancel = () => {
  //   setShowForm(false);
  //   setEditPost(null);
  //   setNewPost({ title: "", content: "" });
  // };

  const handleCommentEditChange = (event) => {
    setEditingCommentText(event.target.value);
  };

  const handleCommentUpdate = async (postId, commentId) => {
    if (editingCommentText.trim() !== "") {
      try {
        await axiosInstance.put(`http://127.0.0.1:8080/board/${postId}/comments/${commentId}`, {
          content: editingCommentText,
        });

        const updatedPosts = posts.map((post) => {
          if (post.id === postId) {
            const updatedComments = post.comments.map((comment) => {
              if (comment.id === commentId) {
                return { ...comment, content: editingCommentText };
              }
              return comment;
            });
            return { ...post, comments: updatedComments };
          }
          return post;
        });

        setPosts(updatedPosts);
        setEditingCommentId(null);
        setEditingCommentText("");
      } catch (error) {
        console.error("Error updating comment:", error);
      }
    }
  };

  const cancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  return (
    <div className="board-container">
      <div className="board-write-form">
        {/* {!showForm && (
          <button onClick={() => setShowForm(true)} className="board-add-button">
            글작성
          </button>
        )}
        {showForm && (
          <button onClick={handleCancel} className="board-cancel-button">
            취소
          </button>
        )} */}
      </div>
      {showForm && (
        <form className="board-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="제목"
            name="title"
            value={newPost.title}
            onChange={handleInputChange}
          />
          <textarea
            placeholder="내용"
            name="content"
            value={newPost.content}
            onChange={handleInputChange}
          />
          <button type="submit">{editPost ? "수정" : "추가"}</button>
        </form>
      )}
      <table className="board-table">
        <thead>
          <tr>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <React.Fragment key={post.id}>
              <tr>
                <td onClick={() => togglePostContent(post.id)}>
                <div className="post-title">
                  <span>{post.title}</span>
                  {post.comments.length > 0 && (
                    <span className="comment-count">   {post.comments.length}</span>
                  )}
                </div>
                </td>
                <td>{post.author}</td>
                <td>{new Date(post.createdAt).toLocaleString()}</td>
              </tr>
              {expandedPostId === post.id && (
                <tr>
                  <td colSpan={5}>
                    <div className="board-expanded-form">
                      <div className="post-section">
                      <h3>{post.title}</h3>
                      <textarea readOnly>{post.content}</textarea>
                      <div>
                        <div className="post-buttons">
                          <button onClick={() => handleEdit(post)}>수정</button>
                          <button onClick={() => handleDelete(post.id)}>삭제</button>
                          </div>
                        </div>
                        <br />
                        <br />
                        <br />
                        <h4>▪️ Comment</h4>
                        <div className="comments-section">
                          {post.comments.map((comment) => (
                            <div key={comment.id}>
                              {editingCommentId === comment.id ? (
                                <div>
                                  <textarea
                                    placeholder="댓글을 수정하세요."
                                    value={editingCommentText}
                                    onChange={handleCommentEditChange}
                                  />
                                  <button onClick={() => handleCommentUpdate(post.id, comment.id)}>수정 완료</button>
                                  <button onClick={cancelCommentEdit}>취소</button>
                                </div>
                              ) : (
                                <div>
                                  <p>
                                    <span class="author-name">{comment.author}</span>
                                  </p>
                                  <p>
                                    <span class="content-name">{comment.content}</span>
                                  </p>
                                  <p>
                                    <span class="date-name" >{new Date(comment.createdAt).toLocaleString()}</span>
                                  </p>
                                  <div className="comment-buttons">
                                  <button onClick={() => handleEditComment(post.id, comment.id, comment.content)}>수정</button>
                                  <button onClick={() => deleteComment(post.id, comment.id)}>삭제</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <h4>Add Comment</h4>
                        <div className="comment-input">
                          <textarea
                            placeholder="댓글을 입력하세요."
                            onChange={(e) => setCommentText(e.target.value)}
                            value={commentText}
                          />
                          <button onClick={() => handleAddComment(post.id)}>댓글 추가</button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Board;