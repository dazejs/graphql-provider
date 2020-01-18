import { Controller, Http, Route } from "@dazejs/framework/dist";

@Route("/test")
export default class TestController extends Controller {

  @Http.Get("/hello")
  hello() {
    return "hello";
  }
}
