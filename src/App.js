import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { favoritarAction, removerFavoritoAction } from "./store/actions/commonActions";
import { Button, Card, Col, Form, Input, List, Row, Select, Tabs } from "antd";
import { useState } from "react";
import axios from "axios";
import { FaRegHeart, FaHeart } from "react-icons/fa";


const endpoint = "https://api.github.com";
const { TabPane } = Tabs;
const { Option } = Select;

function App() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [type, setType] = useState();
  const [controle, setControle] = useState(true)

  const dispatch = useDispatch();
  const { favoritos } = useSelector((s) => s.common);
  async function search(query, type, per_page = 30, page = 1) {
    setLoading(true);
    setType(type);
    const res = await axios.get(`${endpoint}/search/${type}?q=${query}&per_page=${per_page}&page=${page}`);
    if (res.status === 200) {
      setList(res.data.items);
      setTotalCount(res.data.total_count);
      setControle(true);

    }
    setLoading(false);
  }

  async function onFinish(values) {
    setControle(false);
    search(values.query, values.tipo);
    setQ(values.query);
  }

  function changePage(page, pageSize) {
    search(q, pageSize, page);
  }

  function favoritar(repository) {
    dispatch(favoritarAction(repository));
  }

  function removerFavorito(repository) {
    dispatch(removerFavoritoAction(repository));
  }


  const itemCard = (item, type) => {
    if (type === 'repositories' && controle) {
      return (
        <Card
          actions={[
            favoritos.find((it) => it.id === item.id) ? (
              <FaHeart onClick={() => removerFavorito(item)} />
            ) : (
                <FaRegHeart onClick={() => favoritar(item)} />
              ),
          ]}
          cover={<img alt="example" src={item.owner.avatar_url} />}
        >
          <h3>
            <a href={item.html_url} target="_blank">
              {item.name}
            </a>
          </h3>
          <p>
            <a href={item.owner.html_url} target="_blank">
              {item.owner.login}
            </a>
          </p>
        </Card>
      );
    }
    return (
      <Card
        actions={[
          favoritos.find((it) => it.id === item.id) ? (
            <FaHeart onClick={() => removerFavorito(item)} />
          ) : (
              <FaRegHeart onClick={() => favoritar(item)} />
            ),
        ]}
        cover={<img alt="example" src={item.avatar_url} />}
      >
        <h3>
          <a href={item.html_url} target="_blank">
            {item.name}
          </a>
        </h3>
        <p>
          <a href={item.html_url} target="_blank">
            {item.login}
          </a>
        </p>
      </Card>
    );
  };

  return (
    <div className="App">
      <Tabs defaultActiveKey="1" type="card">
        <TabPane tab="Buscar" key="1">
          <Form onFinish={onFinish} form={form}>
            <Row gutter={16}>
              <Col sm={3}>
                <Form.Item name="tipo">
                  <Select
                    placeholder="Selecione o tipo"
                    name="tipo"
                  >
                    <Option value="users">Usuarios</Option>
                    <Option value="repositories">Repositorios</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col sm={10}>
                <Form.Item name="query" rules={[{ required: true, message: "Campo Obrigatório" }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col sm={4}>
                <Button loading={loading} htmlType="submit">
                  Buscar
                </Button>
              </Col>
            </Row>
          </Form>
          <List
            loading={loading}
            grid={{ gutter: 16, column: 6 }}
            dataSource={list}
            pagination={{
              total: totalCount,
              pageSize: 30,
              onChange: changePage,
            }}
            renderItem={(item) => <List.Item>{itemCard(item, type)}</List.Item>}
          />
        </TabPane>
        <TabPane tab={`Favoritos (${favoritos.length})`} key="2">
          <List
            loading={loading}
            grid={{ gutter: 16, column: 6 }}
            dataSource={favoritos}
            renderItem={(item) => <List.Item>{itemCard(item, type)}</List.Item>}
          />
        </TabPane>
      </Tabs>
    </div>
  );
}

export default App;
