import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CommentCard } from '@/components/features/forum/comment-card'
import { ArrowLeft } from 'lucide-react';
import { createLazyRoute, getRouteApi, Link } from '@tanstack/react-router';
import { formatDate } from '@/lib/utils';
import TextEditor from '@/components/features/forum/text-editor';


interface Post {
  id: number;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  content: string;
  timestamp: string;
  likes: {
    name: string;
  }[];
}


const mockTopic = {
  id: 1,
  title: 'FE - ENT503',
  type: 'Hỏi Đáp',
  dateCreated: '2024-01-15T09:41:00',
};

const mockComments: Post[] = [
  {
    id: 1,
    author: {
      name: 'ATho143',
      role: 'FPT Student',
    },
    content:
      'Cho mình hỏi môn PMG201c retake FE mới năm có bị out suốt so với thì lần 1 không ạ 🤔',
    timestamp: '2024-01-11T21:27:00',
    likes: [
      { name: "John Doe" },
      { name: "Mary Smith" },
      { name: "Robert Johnson" },
    ]
  },
  {
    id: 2,
    author: {
      name: 'nguyenvan',
      role: 'FPT Student',
    },
    content:
      'Theo mình biết thì đề retake thường khó hơn một chút so với lần đầu, nhưng không quá nhiều. Quan trọng là bạn cần ôn kỹ những phần đã sai ở lần trước.',
    timestamp: '2024-01-11T21:35:00',
    likes: [
      { name: "John Doe", },
      { name: "Mary Smith" },
      { name: "Robert Johnson" },
    ]
  },
  {
    id: 3,
    author: {
      name: 'hoangminh',
      role: 'Mentor',
    },
    content:
      'Chào bạn! Mình là mentor môn PMG201c. Đề retake sẽ có độ khó tương đương với đề chính, nhưng format câu hỏi có thể khác một chút. Bạn nên focus vào các concepts chính và làm thêm bài tập để quen với nhiều dạng câu hỏi nhé.',
    timestamp: '2024-01-11T22:10:00',
    likes: []
  },
  {
    id: 4,
    author: {
      name: 'thitle',
      role: 'FPT Student',
    },
    content: `
    <div>
      <h2><strong>Where does it come from?</strong></h2>
      <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.</p>
      <p>The standard chunk of Lorem Ipsum <em>used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.</em></p>
      </div>
      <div>
      <h2><strong>Where can I get some?</strong></h2>
      <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with</p>
      <p><img src="https://storage.quocdk.id.vn/mentor-x-dev/c62d1556-ad91-4a07-a561-7f285009fcbc.jpg" alt="" width="187" height="187"></p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      </div>
    `,
    timestamp: '2024-01-11T22:45:00',
    likes: []
  },
];



const route = getRouteApi('/public/forum/topic/$topicId');


export function TopicDetail() {
  const { topicId } = route.useParams();
  return (
    <div className="container mx-auto px-4 pt-6 pb-6">
      <div className="w-full space-y-6">
        <Button variant="outline" className="mb-4" asChild>
          <Link to='/forum'>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Link>
        </Button>

        <div className="space-y-3">
          <Badge variant="outline" className="text-sm">
            #{topicId} {mockTopic.type}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">{mockTopic.title}</h1>
          <p className="text-muted-foreground">{formatDate(mockTopic.dateCreated)}</p>
        </div>

        <div className="space-y-4">
          {mockComments.map((post, index) => (
            <CommentCard key={post.id} post={post} commentNumber={index + 1} />
          ))}
        </div>

        <TextEditor />
      </div>
    </div>
  );
}

export const Route = createLazyRoute('/public/forum/topic/$topicId')({
  component: TopicDetail
})
