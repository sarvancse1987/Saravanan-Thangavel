using Autofac;
using Autofac.Integration.WebApi;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Http;

namespace CMSAPI.App_Start
{
    public class CMSRepositoryContainer
    {
        public static void Initialise()
        {
            var configuration = GlobalConfiguration.Configuration;
            var builder = new ContainerBuilder();
            //builder.ConfigureWebApi(configuration);
            builder.RegisterApiControllers(Assembly.GetExecutingAssembly());
            builder.RegisterAssemblyTypes(AppDomain.CurrentDomain.GetAssemblies()).Where(t => t.Name.EndsWith("BAL")).AsImplementedInterfaces();
            builder.RegisterAssemblyTypes(AppDomain.CurrentDomain.GetAssemblies()).Where(t => t.Name.EndsWith("DAL")).AsImplementedInterfaces();
            var container = builder.Build();
            var resolver = new AutofacWebApiDependencyResolver(container);
            //configuration.ServiceResolver.SetResolver(resolver);
            configuration.DependencyResolver = resolver;
        }
    }
}