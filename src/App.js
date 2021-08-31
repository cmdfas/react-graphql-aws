import config from './aws-exports'

import { API } from 'aws-amplify'
import { listBlogs } from './graphql/queries'
import { createBlog } from './graphql/mutations'
import { onCreateBlog } from './graphql/subscriptions'
import { useEffect } from 'react'

function App() {
  // 创建数据
  const createData = async () => {
    const blogName = prompt('请输入博客名称')
    let data = await fetch(config.aws_appsync_graphqlEndpoint, {
      method: 'POST',
      headers: {
        'X-Api-Key': config.aws_appsync_apiKey
      },
      body: JSON.stringify({
        query: `mutation CreateBlog {
          createBlog(input: {name: "${blogName}"}) {
            id
            name
          }
        }`,
      })
    })
    data = await data.json()
    console.log(data)
  }

  // 获取数据列表
  const pullData = async () => {
    let data = await fetch(config.aws_appsync_graphqlEndpoint, {
      method: 'POST',
      headers: {
        'X-Api-Key': config.aws_appsync_apiKey
      },
      body: JSON.stringify({
        query: `query MyQuery {
          listBlogs {
            items {
              name
              posts {
                items {
                  id
                  title
                }
              }
            }
          }
        }`
      })
    })
    data = await data.json()
    console.log(data)
  }

  // aws 创建博客
  const awsCreateBlog = async () => {
    const blogName = prompt('请输入博客名称')
    const data = await API.graphql({ query: createBlog, variables: { input: { name: blogName }} })
    console.log(data)
  }

  // aws 获取博客列表
  const awsListBlog = async () => {
    const data = await API.graphql({ query: listBlogs })
    console.log(data)
  }

  useEffect(() => {
    // 监听博客创建事件
    const subscription = API.graphql({
      query: onCreateBlog
    }).subscribe({
      next: data => {
        awsListBlog()
      },
      error: err => {
        console.log(err)
      }
    })

    return () => subscription.unsubscribe()
  }, [])


  return (
    <div className="App">
      <button onClick={createData}>创建博客</button>
      <button onClick={pullData}>博客列表</button>
      <br/><br/>
      <button onClick={awsCreateBlog}>AWS 创建博客</button>
    </div>
  );
}

export default App;
