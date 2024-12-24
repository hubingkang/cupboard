import { useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Form,
  InputNumber,
  Row,
  Col,
  Space,
  Card,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import "./App.css";

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};

function App() {
  // const [formValues, setFormValues] = useState();
  const [result, setResult] = useState();
  const [drawerResult, setDrawerResult] = useState();

  const onFinish = (values) => {
    const {
      boardThickness,
      backboardThickness,
      height,
      width,
      depth,
      leftEnds,
      rightEnds,
      topEnds,
      bottomBaseboard,
      // endsSpace,
      fixedWidth,
      averageCount,
    } = values;

    const cupboardHeight = height - topEnds; // 未减间隙
    const cupboardWidth = width - (leftEnds + rightEnds);
    const cupboardDepth = depth - backboardThickness; // 深度 - 背板厚度

    // 如果第一个没写，则表示没有固定尺寸
    const fixedWidthLength = [null, 0].includes(fixedWidth[0])
      ? 0
      : fixedWidth.length;

    console.log("fixedWidth", fixedWidth);
    const sides = {
      name: "左右侧板",
      height: cupboardHeight,
      width: cupboardDepth,
      count: 2,
    };

    const topAndBottom = {
      name: "顶底板",
      height: cupboardWidth - 2 * boardThickness,
      width: cupboardDepth,
      count: 2,
    };

    const riser = {
      name: "中竖板",
      height: sides.height - 2 * boardThickness - bottomBaseboard, // 柜高 - 上下板 - 踢脚线高度
      width: cupboardDepth,
      count: fixedWidthLength + averageCount - 1,
    };

    // fixedWidth: [
    //   {
    //     width: 400,
    //     height: [
    //       {
    //         fixedHeight: 400,
    //       },
    //       {
    //         fixedHeight: 300,
    //       },
    //     ],
    //     averageCount: 1,
    //   },
    // ],
    // averageCount: 2,
    const params = {
      setting: values,
      cupboardHeight,
      cupboardWidth,
      cupboardDepth,
      sides,
      topAndBottom,
      riser,
      bottomBaseboard: {
        name: "踢脚线",
        height: topAndBottom.height,
        width: bottomBaseboard,
        count: 1,
      },
      interlayer: [
        ...fixedWidth.map((item) => {
          return {
            name: `固定层板${item.width}`,
            height: item.width,
            width: cupboardDepth,
            count: "-",
          };
        }),
        {
          name: `其他均分${averageCount}格层板`,
          height:
            (topAndBottom.height -
              fixedWidthLength * boardThickness -
              (averageCount - 1) * boardThickness -
              (fixedWidthLength
                ? fixedWidth.reduce((pre, item) => pre + item.width, 0) *
                  (averageCount - 1)
                : 0)) /
            averageCount, // 顶底板的长度 - 固定数量 * 板厚 - （均分数量 - 1） * 板厚
          width: cupboardDepth,
          count: "-",
        },
      ],
      innerContainer: [
        ...fixedWidth.map((item) => {
          return {
            width: item.width,
            height: riser.height,
            children: [
              ...item.height.map((v) => ({
                width: item.width,
                height: v.fixedHeight,
              })),
              ...new Array(item.averageCount).fill(0).map((_item) => ({
                width: item.width,
                height:
                  (riser.height -
                    item.height.reduce((p, i) => p + i.fixedHeight, 0) -
                    item.height.length * boardThickness -
                    (item.averageCount - 1) * boardThickness) /
                  item.averageCount,
              })),
            ],
          };
        }),
        ...new Array(averageCount).fill(0).map((_item) => ({
          width:
            (topAndBottom.height -
              fixedWidthLength * boardThickness -
              (averageCount - 1) * boardThickness -
              (fixedWidthLength
                ? fixedWidth.reduce((pre, item) => pre + item.width, 0) *
                  (averageCount - 1)
                : 0)) /
            averageCount,
          height: riser.height,
        })),
      ],
    };
    setResult(params);
    console.log("Success:", values);
    console.log("params:", params);
  };

  // 抽屉
  const onDrawerFinish = (values) => {
    const {
      boardThickness,
      backBoardThickness,
      bottomBoardThickness,
      height,
      width,
      depth,
      bothSidesSpace,
      topSpace,
      bottomSpace,
      backSpace,
    } = values;

    const drawerHeight = height - topSpace - bottomSpace - bottomBoardThickness; // 内高 - 顶部 - 底部 - 底板厚度

    const params = {
      setting: values,
      bothSider: {
        name: "抽屉左右板",
        height: drawerHeight,
        width: depth - backBoardThickness - backSpace,
        count: 2,
      },
      frontAndBack: {
        name: "抽屉前后板",
        height: drawerHeight,
        width: width - bothSidesSpace - 2 * boardThickness,
        count: 2,
      },
      bottom: {
        name: "抽屉底板",
        height: depth - backBoardThickness - backSpace,
        width: width - bothSidesSpace,
        count: 1,
      },
    };
    setDrawerResult(params);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const dataSource = useMemo(() => {
    if (!result) return [];

    return [
      result.sides,
      result.topAndBottom,
      result.riser,
      result.bottomBaseboard,
      ...result.interlayer,
    ];
  }, [result]);

  const drawerDataSource = useMemo(() => {
    if (!drawerResult) return [];

    return [
      drawerResult.bothSider,
      drawerResult.frontAndBack,
      drawerResult.bottom,
    ];
  }, [drawerResult]);

  return (
    <div>
      <Row gutter={24}>
        <Col span={12}>
          <Form
            initialValues={{
              boardThickness: 18,
              backboardThickness: 18,
              height: 2400,
              width: 1600,
              depth: 600,
              leftEnds: 20,
              rightEnds: 20,
              topEnds: 18,
              bottomBaseboard: 80,
              // endsSpace: 2,
              // fixedWidth: [600],
              fixedWidth: [
                {
                  width: 400,
                  height: [
                    {
                      fixedHeight: 400,
                    },
                    {
                      fixedHeight: 300,
                    },
                  ],
                  averageCount: 2,
                },
              ],
              averageCount: 2,
              // remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
          >
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item label="板材厚度" name="boardThickness">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="背板厚度" name="backboardThickness">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item label="高" name="height">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="宽" name="width">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="深" name="depth">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <Form.List name="fixedWidth">
                  {(fields, { add, remove }) => (
                    <div
                      style={{
                        display: "flex",
                        rowGap: 16,
                        flexDirection: "column",
                      }}
                    >
                      {fields.map((field) => (
                        <Card
                          size="small"
                          title={`固定宽度 ${field.name + 1}`}
                          key={field.key}
                          extra={
                            <MinusCircleOutlined
                              onClick={() => {
                                remove(field.name);
                              }}
                            />
                          }
                        >
                          <Form.Item
                            label="固定宽度"
                            name={[field.name, "width"]}
                            initialValue={100}
                          >
                            <InputNumber style={{ width: "100%" }} />
                          </Form.Item>

                          {/* Nest Form.List */}
                          <Form.Item label="固定高度">
                            <Form.List name={[field.name, "height"]}>
                              {(subFields, subOpt) => (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    rowGap: 16,
                                  }}
                                >
                                  {subFields.map((subField) => (
                                    <Space key={subField.key}>
                                      <Form.Item
                                        noStyle
                                        name={[subField.name, "fixedHeight"]}
                                        initialValue={100}
                                      >
                                        <InputNumber
                                          style={{ width: "100%" }}
                                        />
                                      </Form.Item>
                                      <MinusCircleOutlined
                                        onClick={() => {
                                          subOpt.remove(subField.name);
                                        }}
                                      />
                                    </Space>
                                  ))}
                                  <Button
                                    type="dashed"
                                    onClick={() => subOpt.add()}
                                    block
                                  >
                                    + 新增固定高度
                                  </Button>
                                </div>
                              )}
                            </Form.List>
                            <Form.Item
                              label="其他均分数量"
                              name={[field.name, "averageCount"]}
                              initialValue={1}
                            >
                              <InputNumber style={{ width: "100%" }} />
                            </Form.Item>
                          </Form.Item>
                        </Card>
                      ))}

                      <Button type="dashed" onClick={() => add()} block>
                        + 新增固定宽度
                      </Button>
                    </div>
                  )}
                </Form.List>
              </Col>

              <Col span={6}>
                <Form.Item label="均分数量" name="averageCount">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item label="左收口" name="leftEnds">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="右收口" name="rightEnds">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item label="顶收口" name="topEnds">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="底部踢脚线" name="bottomBaseboard">
                  <InputNumber style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                计算
              </Button>
            </Form.Item>
          </Form>
        </Col>

        <Col span={12} style={{ maxHeight: "1000px" }}>
          <div
            style={{
              display: "flex",
              transform: "scale(0.3)",
              transformOrigin: "top left",
              fontSize: "64px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: result?.cupboardHeight,
                marginTop: "200px",
                width: "200px",
                background: "red",
              }}
            >
              高度{result?.cupboardHeight}
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  textAlign: "center",
                  height: "200px",
                  width: result?.cupboardWidth,
                  background: "green",
                }}
              >
                宽度{result?.cupboardWidth}
              </div>
              <div
                style={{
                  width: result?.cupboardWidth,
                  height: result?.cupboardHeight,
                  background: "black",
                  display: "flex",
                }}
              >
                <div
                  style={{
                    width: result?.setting?.boardThickness,
                    height: result?.cupboardHeight,
                    background: "#ebc688",
                  }}
                />

                <div
                  style={{
                    width: result?.topAndBottom.height,
                    height: result?.setting?.boardThickness,
                    background: "black",
                  }}
                >
                  <div
                    style={{
                      width: result?.topAndBottom.height,
                      height: result?.setting?.boardThickness,
                      background: "#ebc688",
                    }}
                  ></div>
                  {/* 中间竖板 */}
                  <div style={{ display: "flex" }}>
                    {result?.innerContainer.map((item, i) => {
                      return (
                        <div key={i} style={{ display: "flex" }}>
                          {i !== 0 && (
                            <div
                              style={{
                                width: result?.setting?.boardThickness,
                                height: item.height,
                                background: "#ebc688",
                              }}
                            ></div>
                          )}
                          <div
                            style={{
                              width: item.width,
                              height: item.height,
                              background: "red",
                            }}
                          >
                            {item.children?.length ? (
                              item.children?.map((_item, _index) => {
                                return (
                                  <div key={_index}>
                                    {_index !== 0 && (
                                      <div
                                        style={{
                                          width: _item.width,
                                          height:
                                            result?.setting?.boardThickness,
                                          background: "#ebc688",
                                        }}
                                      ></div>
                                    )}
                                    <div
                                      style={{
                                        width: _item.width,
                                        height: _item.height,
                                        background: "white",
                                      }}
                                    >
                                      <div>宽: {_item.width}</div>
                                      <div>高: {_item.height}</div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div
                                style={{
                                  width: item.width,
                                  height: item.height,
                                  background: "white",
                                }}
                              >
                                <div>宽: {item.width}</div>
                                <div>高: {item.height}</div>
                              </div>
                            )}
                          </div>
                        </div>

                        // <>
                        //   <div
                        //     style={{
                        //       width: item,
                        //       height: result?.riser?.height,
                        //       background: "white",
                        //     }}
                        //   ></div>
                        //   <div
                        //     style={{
                        //       width: result?.setting?.boardThickness,
                        //       height: result?.riser?.height,
                        //       background: "blue",
                        //     }}
                        //   ></div>
                        // </>
                      );
                    })}

                    <div
                      style={{
                        width:
                          result?.topAndBottom.height -
                          result?.setting?.fixedWidth.reduce(
                            (pre, item) => pre + item,
                            0
                          ),
                        height: result?.riser?.height,
                        background: "yellow",
                      }}
                    ></div>
                  </div>
                  <div
                    style={{
                      width: result?.topAndBottom.height,
                      height: result?.setting?.boardThickness,
                      background: "#ebc688",
                    }}
                  ></div>
                  <div
                    style={{
                      width: result?.bottomBaseboard.height,
                      height: result?.bottomBaseboard?.width,
                      background: "green",
                    }}
                  >
                    <div>
                      宽: {result?.bottomBaseboard.height} 高:{" "}
                      {result?.bottomBaseboard?.width}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    width: result?.setting?.boardThickness,
                    height: result?.cupboardHeight,
                    background: "#ebc688",
                  }}
                />
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* <div>
        <div>
          <Space size={24}>
            <div>总宽度校验:</div>
            {result?.sides.count * result?.setting?.boardThickness +
              result?.topAndBottom.height +
              result?.setting.leftEnds +
              result?.setting.rightEnds ===
            result?.setting.width
              ? "总宽度一致 ✅"
              : "总宽度不一致 ❌"}
          </Space>
        </div>

        <div>
          <Space size={24}>
            <div>总高度校验:</div>
            {result?.sides.height + result?.setting.topEnds ===
            result?.setting.height
              ? "总高度一致 ✅"
              : "总高度不一致 ❌"}
          </Space>
        </div>

        <div>
          <Space size={24}>
            <div>总深度校验:</div>
            {result?.sides.width + result?.setting?.boardThickness ===
            result?.setting.depth
              ? "总深度一致 ✅"
              : "总深度不一致 ❌"}
          </Space>
        </div>

        <div>
          <Space size={24}>
            <div>柜体宽度校验:</div>
            {result?.sides.count * result?.setting?.boardThickness +
              result?.topAndBottom.height ===
            result?.cupboardWidth
              ? "柜体宽度一致 ✅"
              : "柜体宽度不一致 ❌"}
          </Space>
        </div>
        <div>
          <Space size={24}>
            <div>柜体高度校验:</div>
            {result?.sides.height === result?.cupboardHeight
              ? "柜体高度一致 ✅"
              : "柜体高度不一致 ❌"}
          </Space>
        </div>
      </div> */}

      <div>
        <div
          style={{
            display: "flex",
            background: "green",
            color: "white",
            padding: "8px",
          }}
        >
          <div style={{ flex: "1" }}>类型</div>
          <div style={{ flex: "1" }}>长</div>
          <div style={{ flex: "1" }}>宽</div>
          <div style={{ flex: "1" }}>数量</div>
        </div>

        {dataSource.map((item, index) => {
          return (
            <div key={index} style={{ display: "flex", padding: "8px" }}>
              <div style={{ flex: "1" }}>{item.name}</div>
              <div style={{ flex: "1" }}>{item.height}</div>
              <div style={{ flex: "1" }}>{item.width}</div>
              <div style={{ flex: "1" }}>{item.count}</div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          background: "black",
          padding: "2px",
          margin: "40px 0",
        }}
      ></div>

      <Form
        initialValues={{
          boardThickness: 18,
          backBoardThickness: 18,
          bottomBoardThickness: 18,
          height: 200,
          width: 400,
          depth: 600,
          bothSidesSpace: 26,
          topSpace: 20,
          bottomSpace: 10,
          backSpace: 30,
        }}
        onFinish={onDrawerFinish}
        autoComplete="off"
        layout="vertical"
      >
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item label="板材厚度" name="boardThickness">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="背板厚度" name="backBoardThickness">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="底板厚度" name="bottomBoardThickness">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item label="高" name="height">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="宽" name="width">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="深(包括背板，单测量的深度)" name="depth">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={6}>
            <Form.Item label="左右共预留间隔" name="bothSidesSpace">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="上预留间隔" name="topSpace">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="底预留间隔" name="bottomSpace">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="内部预留间隔" name="backSpace">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            计算
          </Button>
        </Form.Item>
      </Form>

      <div>
        <div
          style={{
            display: "flex",
            background: "green",
            color: "white",
            padding: "8px",
          }}
        >
          <div style={{ flex: "1" }}>类型</div>
          <div style={{ flex: "1" }}>长</div>
          <div style={{ flex: "1" }}>宽</div>
          <div style={{ flex: "1" }}>数量</div>
        </div>

        {drawerDataSource.map((item, index) => {
          return (
            <div key={index} style={{ display: "flex", padding: "8px" }}>
              <div style={{ flex: "1" }}>{item.name}</div>
              <div style={{ flex: "1" }}>{item.height}</div>
              <div style={{ flex: "1" }}>{item.width}</div>
              <div style={{ flex: "1" }}>{item.count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
