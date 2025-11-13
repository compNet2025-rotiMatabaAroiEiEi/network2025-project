import IconInsertVoice from "../asset/icon_insert_voice.svg?react";
import IconInsertFile from "../asset/icon_insert_file.svg?react";
import IconSend from "../asset/icon_send.svg?react";
import secretAvatar from "../asset/avatar_secret.png";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ANIMATION, slideLeftRight } from "../style/animation";

const ChatBox = ({ name }) => {
  const mockData = [
    {
      name: "John",
      image: "/src/asset/avatar_santa.png",
      message:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut necessitatibus aperiam nostrum facilis fuga sed temporibus ad ducimus maiores delectus suscipit quae asperiores aspernatur dolorem ipsam, at pariatur sint magnam veritatis maxime voluptas non. Voluptatum repellat aperiam, nemo cumque iusto iure amet eius quae maxime vel accusamus libero numquam, esse possimus odio pariatur molestias. Quos pariatur, cum voluptatum sequi voluptatem alias sit eos quia. Facere est aspernatur dicta ipsa hic animi dolor eum, corporis exercitationem vitae, dolorem debitis. Hic dolorum tenetur alias iusto quis pariatur dolores, vitae, obcaecati deleniti, molestias voluptatum consequuntur. Harum qui in cumque, quia perspiciatis enim quae aliquam suscipit ratione adipisci velit fugit. Adipisci quas magni nemo enim. Qui asperiores culpa illo. Vel nam, nostrum alias perspiciatis atque, dignissimos aliquam eius, quaerat praesentium adipisci sit harum quos corporis a! Molestiae quisquam iste magni adipisci tenetur, et dolore amet rerum labore ea eaque, magnam distinctio minima enim! Qui labore tempore odit dignissimos expedita aliquid voluptas officia eveniet tenetur magni fuga laudantium a praesentium ducimus minus in nam explicabo, obcaecati molestias quidem! Perspiciatis laudantium, voluptate iste ex placeat natus esse repellendus adipisci similique, alias totam suscipit cum? Blanditiis molestiae quis tempora optio eveniet dolorem rem maxime exercitationem ab a molestias, ipsum quos vel sed earum praesentium hic quasi soluta fugiat eius quia in fugit excepturi. Recusandae itaque vero, numquam sapiente explicabo possimus. Repellat, illum quas a corporis voluptate ullam magni voluptatibus numquam nemo amet excepturi nobis officia doloremque, ipsum laborum minima tempore, atque iure expedita. Maxime aperiam libero repellat, provident, deserunt sunt est nulla illum quasi reprehenderit accusamus nihil qui tenetur? Veniam tenetur sunt ipsum, quisquam adipisci quasi et dolore rem sit facere modi eaque, dicta illum ullam iste vel praesentium optio ipsam repellendus ipsa aliquid necessitatibus reiciendis voluptatem! Eum odio quo quam, eligendi minus doloremque autem culpa non odit repellendus, nesciunt repudiandae hic commodi! Voluptas debitis ea inventore molestiae dolore animi blanditiis perspiciatis ipsum, magnam doloremque nemo aspernatur illum cupiditate optio placeat corrupti incidunt saepe deserunt. Natus debitis, ea temporibus similique cupiditate saepe numquam quisquam expedita, fugiat vitae sed ipsa magni ex accusamus adipisci aliquam cumque nisi iste minus! Eveniet consectetur obcaecati deserunt nobis nam facilis fugit maiores praesentium, ea expedita neque autem illo quibusdam deleniti veniam, optio est nostrum? Molestias molestiae temporibus provident in, facilis animi odit ab aliquid quasi expedita quos totam suscipit iusto quaerat. Suscipit voluptatibus tempore quas laborum ipsa delectus tempora expedita voluptate, earum repellat cumque nisi a excepturi. Beatae dolorem similique dolores! Beatae, ab placeat? Ab officia dolorem doloremque voluptatem consectetur corrupti optio totam quidem officiis odit ipsam consequuntur, rem adipisci sunt neque perferendis voluptatibus error magni tempora ut! Excepturi sint quibusdam commodi hic, sed dolorem dolor magnam natus facilis, deleniti minus placeat sit voluptatibus. Libero quia rem esse architecto. Vel veniam laudantium minima ducimus obcaecati officia quidem porro, modi sapiente aliquid placeat accusantium architecto, velit officiis rerum a molestiae, vero dolor soluta ipsum iste ut! Exercitationem ipsa alias cupiditate deserunt ab. Dicta enim voluptate placeat, nisi vel rerum consectetur suscipit totam harum!",
      isMe: true,
    },
    {
      name: "John",
      image: "/src/asset/avatar_santa.png",
      message: "LOL",
      isMe: true,
    },
    {
      name: "Johna",
      image: "/src/asset/avatar_reindeer.png",
      message: "Hello",
      isMe: false,
    },
    {
      name: "Johna",
      image: "/src/asset/avatar_reindeer.png",
      message: "Nani",
      isMe: false,
    },
    {
      name: "LALA",
      image: "/src/asset/avatar_reindeer.png",
      message:
        "Hello my name in reindeer i want to eat nut and i love fish so much hope this christmas i can has hat",
      isMe: false,
    },
    {
      name: null,
      image: null,
      message:
        "Hello my name in reindeer i want to eat nut and i love fish so much hope this christmas i can has hat",
      isMe: false,
    },
    {
      name: "Johna",
      image: "/src/asset/avatar_reindeer.png",
      message:
        "Hello my name in reindeer i want to eat nut and i love fish so much hope this christmas i can has hat",
      isMe: false,
    },
  ];
  const [chatData, setChatData] = useState(mockData);
  const chatBoxSpaceRef = useRef(null);

  const displayImage = (data, prevData) => {
    if (data.name !== prevData) {
      return (
        <div className="mt-3 flex items-end gap-2">
          <img
            src={data.image || secretAvatar}
            alt="avatar"
            className="avatar avatar-chatbox"
          />
          {(!data.isMe && data.name) || "???"}
        </div>
      );
    }
    return;
  };

  useEffect(() => {
    if (chatBoxSpaceRef.current) {
      chatBoxSpaceRef.current.scrollTo({
        top: chatBoxSpaceRef.current.scrollHeight,
        // behavior: "smooth",
      });
    }
  }, []);

  return (
    <div className="relative flex-1 flex flex-col">
      <AnimatePresence>
        <motion.h1
          key={name}
          variants={slideLeftRight}
          initial="slideLeft"
          animate="slideRight"
          exit="slideLeft"
          custom={ANIMATION.duration}
          className="absolute top-0 left-0 m-2 text-6xl z-10"
        >
          {name}
        </motion.h1>
      </AnimatePresence>
      <div
        ref={chatBoxSpaceRef}
        className="w-full p-2 overflow-y-auto scrollbar-none flex-1"
      >
        {chatData.map((data, index) => {
          const prev = index > 0 ? mockData[index - 1].name : "";
          return (
            <div
              key={index}
              className={`px-2 flex flex-col  ${
                data.isMe ? "items-end" : "items-start"
              }`}
            >
              {displayImage(data, prev)}
              <div
                className={`message ${
                  data.isMe ? "message-right" : "message-left"
                }`}
              >
                {data.message}
              </div>
            </div>
          );
        })}
      </div>
      <div className="w-full p-4 bg-(--green-color)">
        <textarea
          className="w-full p-2 text-2xl bg-white/50 outline-0 rounded-xl h-[100px] resize-none"
          autoComplete="off"
          placeholder="Type a message"
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <IconInsertVoice className="icon icon-chatbox icon-chatbox-insert-voice" />
            <IconInsertFile className="icon icon-chatbox icon-chatbox-insert-file" />
          </div>
          <IconSend className="icon icon-chatbox icon-chatbox-send" />
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
