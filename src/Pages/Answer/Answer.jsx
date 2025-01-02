import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../API/axios";
import classes from "./Answer.module.css";
import { FaUserTie } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
// react-redux
import { connect } from "react-redux";
// actions creation function
import { storeUser } from "../../Utility/action";
import { toast } from "react-toastify";

const Answer = ({ user, storeUser }) => {
  const token = localStorage.getItem("token");

  const { questionId: postId } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [userData, setUserData] = useState([]);

  const answerDom = useRef();
  

  const checkUserLogged = async () => {
    try {
      const { data } = await axios.get("/user/check", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      storeUser(data.userName);
      setUserData(data);
      await fetchSingleQuestion();
      await getAnswer();
    } catch (error) {
      // console.log(error.message);
      toast.error("Please log in to your account first. ", {
        position: "top-center",
      });
      navigate("/");
    }
  };

  const fetchSingleQuestion = async () => {
    try {
      const { data } = await axios.get(`/question/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQuestion(data);
      // storeUser(data.userName);
    } catch (error) {
      console.log(error);
      // toast.error("No question found ", {
      //   position: "top-center",
      // });
    }
  };

  const getAnswer = async () => {
    try {
      const { data } = await axios.get(`/answer/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.length === 0) {
        setAnswers([]);
        toast.error("No answer for this question ", {
          position: "top-center",
        });
      }
      setAnswers(data.reverse());
    } catch (error) {
      console.error(error.message);
      // toast.error("Something error fetching answer ", {
      //   position: "top-center",
      // });
    }
  };
  const deleteAnswer = async (userId) => {
    try {
      const { data } = await axios.delete(`/answer/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Handle successful response
      toast.success(data.message, {
        position: "top-center",
      });
      // After deletion, fetch the updated answers
      await getAnswer();
    } catch (error) {
      // Handle error response
      console.error(error);
      toast.error("Something error deleting answer ", {
        position: "top-center",
      });
    }
  };

  const postAnswer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/answer",
        {
          questionId: question?.questionId,
          answer: answerDom.current.value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchSingleQuestion();
      await getAnswer();
      answerDom.current.value = "";
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong", {
        position: "top-center",
      });
    }
  };
  //fetching data when the component mount.(it represent the react)
  useEffect(() => {
    if (user) {
      checkUserLogged();
    } else {
      navigate("/dashboard");
    }
  }, []);
  return (
    <div className={classes.answer__container}>
      <div className={classes.answer__wrapper}>
        <h2>Question</h2>
        <div className={classes.question__detail}>
          <h4>{question?.title}</h4>
          <hr />
          <h6>{question?.description}</h6>
        </div>
        <hr />
        <div className={classes.answer__community}>
          <h1>Answer From The Community</h1>
        </div>
        <hr />
        {answers?.map((singleAnswer, i) => {
          return (
            <>
              <div key={i} className={classes.all__questions}>
                <div className={classes.all__question}>
                  <div className={classes.question__user}>
                    <FaUserTie size={30} />
                    <h6>{singleAnswer.userName}</h6>
                  </div>
                  <div className={classes.question__answer}>
                    <h6>{singleAnswer.answer}</h6>
                  </div>
                </div>
                {userData.userId === singleAnswer.userId && (
                  <div className={classes.question__delete}>
                    <MdDelete
                      className={classes.question__img}
                      size={30}
                      onClick={() => deleteAnswer(userData.userId)}
                    />
                  </div>
                )}
              </div>
            </>
          );
        })}
        <form onSubmit={postAnswer} className={classes.post__answer}>
          <div className={classes.text__area}>
            <textarea rows="4" ref={answerDom} placeholder="Your Answer ..." />
          </div>

          <button type="submit">Post Answer</button>
        </form>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    storeUser: (users) => dispatch(storeUser(users)),
  };
};

// export default Answer;
export default connect(mapStateToProps, mapDispatchToProps)(Answer);
