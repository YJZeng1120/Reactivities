using System;

namespace API.Middleware;

public class ExceptionMiddleware : IMiddleware
{
  public Task InvokeAsync(HttpContext context, RequestDelegate next)
  {
    throw new NotImplementedException();
  }
}
