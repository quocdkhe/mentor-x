


using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("/forum-topics")]
    public class ForumController
    {
        private readonly IForumService _forumService;
        public ForumController(IForumService forumService)
        {
            _forumService = forumService;
        }
        
        public async Task<ActionResult<>> CreateNewTopic()
        {
            
        }
    }
}
