using Microsoft.AspNetCore.Mvc;
using Xunit;

public class UsersControllerTests
{
    private readonly UsersController _controller = new();

    [Fact]
    public void GetUsers_ReturnsOkResult()
    {
        var result = _controller.GetUsers();
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public void GetUser_ExistingId_ReturnsUser()
    {
        var result = _controller.GetUser(1);
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public void GetUser_NonExistingId_ReturnsNotFound()
    {
        var result = _controller.GetUser(999);
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public void CreateUser_ValidUser_ReturnsCreatedResult()
    {
        var user = new User { Name = "Test User", Email = "test@example.com" };
        var result = _controller.CreateUser(user);
        Assert.IsType<CreatedAtActionResult>(result);
    }
}