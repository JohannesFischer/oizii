<div class="row">
  <div class="columns large-12">
    <p class="alert-box" ng-show="noposts">No videos found!<br>The playlist player works with youtube videos only at the moment</p>
  </div>
</div>

<section class="Playlist row"  ng-show="!noposts">
  
  <section class="columns medium-9">
    <h1>#{{ tag }} playlist</h1>
    
    <div class="flex-video player widescreen">
      <%-- the iframe (and video player) will replace this div tag --%>
      <div id="Player"></div>
    </div>
    
    <h2>{{ post.Title }}</h2>
    <!--
    <section class="post-content" ng-bind-html="post.Content"></section>		
    <section class="hash-tags" ng-hide="post.HashTags.length < 1">
      <ul>
        <li ng-repeat="tag in post.HashTags">
          <a ng-href="/#/tag/{{ tag }}">{{ tag }}</a>
        </li>
      </ul>
    </section>
    -->
  </section>
  
  <aside class="columns medium-3 video-list">
    <h3>Videos</h3>
    <ul ng-repeat="post in posts">
      <li ng-class="{current: \$index == currentIndex}" ng-click="play(\$index)">
        <span>{{ \$index +1 }}. {{ post.Title }}</span>
      </li>
    </ul>
  </aside>
  
</section>