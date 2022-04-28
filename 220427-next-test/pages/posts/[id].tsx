import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { getAllPostIds, getPostData, Post as TypePost } from '../../lib/posts'

export async function getStaticProps({ params }: {params: TypePost}) {
  console.log(Number(params.id) % 12 + 1 + '');
  // const postData = getPostData(Number(params.id) % 12 + 1 + '');
  const postData = getPostData(params.id);
  return {
    props: {
      postData,
    },
    revalidate: 10,
  };
}
export async function getStaticPaths() {
  const paths = getAllPostIds();
  // const paths = Array.from({length: 10}, (_, i) => {
  //   return {
  //     params: {
  //       id: i + 1 + '',
  //     },
  //   };
  // });
  return {
    paths,
    // fallback: false,
    fallback: true,
    // fallback: 'blocking',
  }
}
export default function Post({ postData }: { postData: TypePost }) {
  const router = useRouter()

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return <div>Loading...</div>
  }

  return (
    <Layout>
      {postData.title}
      <br />
      {postData.id}
      <br />
      {postData.date}
    </Layout>
  )
}