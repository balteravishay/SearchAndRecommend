FROM microsoft/aspnetcore:1.1.1
ARG source
WORKDIR /app
EXPOSE 80
COPY ${source:-bin/Release/PublishOutput} .
ENTRYPOINT ["dotnet", "SearchRecommendSite.dll"]
