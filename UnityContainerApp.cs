using BAL.Implementation;
using BAL.Interface;
using DAL.Implementation;
using DAL.Interface;
using E2MAS.Web.GUI.Models.E2MAS;
using Microsoft.Practices.Unity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GUI.App_Start
{
    public class UnityContainerApp
    {
        public static IUnityContainer Initialise()
        {
            var container = BuildUnityContainer();
            DependencyResolver.SetResolver(new E2MASUnityDependencyResolver(container));
            return container;
        }
        private static IUnityContainer BuildUnityContainer()
        {
            var container = new UnityContainer();
            container.RegisterType<IEmployeeBAL, EmployeeBAL>(new InjectionConstructor(typeof(EmployeeDAL)));
            container.RegisterType<IManagerBAL, ManagerBAL>(new InjectionConstructor(typeof(EmployeeDAL)));
            container.RegisterType<IMixedBAL, MixedBAL>("MixedBAL");
            container.RegisterType<IMixedBAL, MixedBAL1>("MixedBAL1");
            container.RegisterType<MixedBAL>(new InjectionConstructor(new ResolvedParameter<IMixedBAL>("MixedBAL")));
            container.RegisterType<MixedBAL1>(new InjectionConstructor(new ResolvedParameter<IMixedBAL>("MixedBAL1")));
            return container;
        }
    }
}